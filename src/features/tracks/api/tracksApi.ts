import { baseApi } from '@/app/api/baseApi.ts'
import type { FetchTracksResponse } from '@/features/tracks/api/tracksApi.types.ts'

export const tracksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchTracks: build.infiniteQuery<FetchTracksResponse, void, string | null>({
      infiniteQueryOptions: {
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => {
          return lastPage.meta.nextCursor || null
        },
      },
      query: ({ pageParam }) => {
        return {
          url: 'playlists/tracks',
          params: { cursor: pageParam, paginationType: 'cursor', pageSize: 5 },
        }
      },
    }),
  }),
})
export const { useFetchTracksInfiniteQuery } = tracksApi
