import { baseApi } from '@/app/api/baseApi.ts'
import type { LoginArgs } from './authApi.types'
import { AUTH_KEYS } from '@/common/constants'
import { withZodCatch } from '@/common/utils'
import { loginResponseSchema, meResponseSchema } from '@/features/auth/model/auth.schemas.ts'

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query({
      query: () => `auth/me`,
      ...withZodCatch(meResponseSchema),
      providesTags: ['Auth'],
    }),
    login: build.mutation({
      query: (payload: LoginArgs) => {
        return {
          method: 'post',
          url: 'auth/login',
          body: { ...payload, accessTokenTTL: '30m' },
        }
      },
      ...withZodCatch(loginResponseSchema),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled
        localStorage.setItem(AUTH_KEYS.accessToken, data.accessToken)
        localStorage.setItem(AUTH_KEYS.refreshToken, data.refreshToken)
        // Invalidate after saving tokens
        dispatch(authApi.util.invalidateTags(['Auth']))
      },
    }),
    logout: build.mutation<void, void>({
      query: () => {
        const refreshToken = localStorage.getItem(AUTH_KEYS.refreshToken)
        return {
          method: 'post',
          url: `auth/logout`,
          body: { refreshToken },
        }
      },
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        await queryFulfilled
        localStorage.removeItem(AUTH_KEYS.accessToken)
        localStorage.removeItem(AUTH_KEYS.refreshToken)
        dispatch(baseApi.util.resetApiState())
      },
    }),
  }),
})

export const { useGetMeQuery, useLoginMutation, useLogoutMutation } = authApi
