import type {
  CreatePlaylistArgs,
  CreatePlaylistResponse,
  FetchPlaylistsArgs,
  PlaylistsResponse,
  UpdatePlaylistArgs,
  UpdatePlaylistRequest,
} from './playlistsApi.types'
import { baseApi } from '@/app/api/baseApi.ts'
import type { Images } from '@/common/types'

export const playlistsApi = baseApi.injectEndpoints({
  endpoints: (build) => {
    return {
      fetchPlaylists: build.query<PlaylistsResponse, FetchPlaylistsArgs>({
        query: (params) => {
          return {
            method: 'get',
            url: 'playlists',
            params,
          }
        },
        providesTags: ['Playlist'],
        // keepUnusedDataFor: 60, // время жизни кэша
      }),
      createPlaylist: build.mutation<CreatePlaylistResponse, CreatePlaylistArgs>({
        query: (args) => ({
          method: 'post',
          url: 'playlists',
          body: { data: { type: 'playlists', attributes: args } },
        }),
        invalidatesTags: ['Playlist'],
      }),
      deletePlaylist: build.mutation<void, string>({
        query: (playlistId) => ({
          method: 'delete',
          url: `playlists/${playlistId}`,
        }),
        invalidatesTags: ['Playlist'],
      }),
      updatePlaylist: build.mutation<void, { playlistId: string; body: UpdatePlaylistArgs }>({
        query: ({ playlistId, body }) => {
          const requestBody: UpdatePlaylistRequest = {
            data: { type: 'playlists', attributes: body },
          }
          return {
            method: 'put',
            url: `playlists/${playlistId}`,
            body: requestBody,
          }
        },
        async onQueryStarted({ playlistId, body }, { dispatch, queryFulfilled }) {
          const patchResult = dispatch(
            playlistsApi.util.updateQueryData(
              // название эндпоинта, в котором нужно обновить кэш
              'fetchPlaylists',
              // аргументы для эндпоинта
              { pageNumber: 1, pageSize: 2, search: '' },
              // `updateRecipe` - коллбэк для обновления закэшированного стейта мутабельным образом
              (state) => {
                const index = state.data.findIndex((playlist) => playlist.id === playlistId)
                if (index !== -1) {
                  state.data[index].attributes = { ...state.data[index].attributes, ...body }
                }
              },
            ),
          )
          try {
            await queryFulfilled
          } catch {
            patchResult.undo()
          }
        },
        invalidatesTags: ['Playlist'],
      }),
      uploadPlaylistCover: build.mutation<Images, { playlistId: string; file: File }>({
        query: ({ playlistId, file }) => {
          const formData = new FormData()
          formData.append('file', file)

          return {
            method: 'post',
            url: `/playlists/${playlistId}/images/main`,
            body: formData,
          }
        },
        invalidatesTags: ['Playlist'],
      }),
      deletePlaylistCover: build.mutation<void, { playlistId: string }>({
        query: ({ playlistId }) => {
          return {
            method: 'delete',
            url: `/playlists/${playlistId}/images/main`,
          }
        },
        invalidatesTags: ['Playlist'],
      }),
    }
  },
})

export const {
  useFetchPlaylistsQuery,
  useCreatePlaylistMutation,
  useDeletePlaylistMutation,
  useUpdatePlaylistMutation,
  useUploadPlaylistCoverMutation,
  useDeletePlaylistCoverMutation,
} = playlistsApi
