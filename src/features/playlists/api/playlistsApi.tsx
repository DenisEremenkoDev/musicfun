import type {
  CreatePlaylistArgs,
  CreatePlaylistResponse,
  FetchPlaylistsArgs,
  PlaylistsResponse,
  UpdatePlaylistArgs,
  UpdatePlaylistRequest,
} from './playlistsApi.types'
import { baseApi } from '@/app/api/baseApi.ts'

export const playlistsApi = baseApi.injectEndpoints({
  endpoints: (build) => {
    return {
      fetchPlaylists: build.query<PlaylistsResponse, FetchPlaylistsArgs | void>({
        query: () => {
          return {
            method: 'get',
            url: 'playlists',
          }
        },
        providesTags: ['Playlist'],
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
} = playlistsApi
