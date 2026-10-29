import type {
  CreatePlaylistArgs,
  FetchPlaylistsArgs,
  PlaylistCreatedEvent,
  UpdatePlaylistArgs,
} from './playlistsApi.types'
import { baseApi } from '@/app/api/baseApi.ts'
import type { Images } from '@/common/types'
import { playlistCreateResponseSchema, playlistsResponseSchema } from '@/features/playlists/model/playlists.schemas.ts'
import { imagesSchema } from '@/common/shemas'
import { withZodCatch } from '@/common/utils'
import { io, Socket } from 'socket.io-client'

export const playlistsApi = baseApi.injectEndpoints({
  endpoints: (build) => {
    return {
      fetchPlaylists: build.query({
        query: (params: FetchPlaylistsArgs) => {
          return {
            method: 'get',
            url: 'playlists',
            params,
          }
        },
        ...withZodCatch(playlistsResponseSchema),
        keepUnusedDataFor: 0, // 👈 очистка сразу после размонтирования
        async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
          // Ждем разрешения начального запроса перед продолжением
          await cacheDataLoaded

          // Создаем Socket.IO соединение с сервером
          const socket: Socket = io('https://musicfun.it-incubator.app', {
            path: '/api/1.0/ws', // пользовательский путь для Socket.IO сервера (по умолчанию '/socket.io/')
            transports: ['websocket'],
          })

          socket.on('connect', () => console.log('✅ Подключен к серверу'))

          socket.on('tracks.playlist-created', (msg: PlaylistCreatedEvent) => {
            // 1 вариант
            const newPlaylist = msg.payload.data
            updateCachedData((state) => {
              state.data.pop()
              state.data.unshift(newPlaylist)
              state.meta.totalCount = state.meta.totalCount + 1
              state.meta.pagesCount = Math.ceil(state.meta.totalCount / state.meta.pageSize)
            })
            // 2 вариант
            // dispatch(playlistsApi.util.invalidateTags(['Playlist']))
          })

          // CacheEntryRemoved разрешится, когда подписка на кеш больше не активна
          await cacheEntryRemoved
          // Выполняем шаги очистки после разрешения промиса `cacheEntryRemoved`
          socket.on('disconnect', () => console.log('❌ Соединение разорвано'))
        },
        providesTags: ['Playlist'],
        // keepUnusedDataFor: 60, // время жизни кэша
      }),
      createPlaylist: build.mutation({
        query: (args: CreatePlaylistArgs) => ({
          method: 'post',
          url: 'playlists',
          body: { data: { type: 'playlists', attributes: args } },
        }),
        ...withZodCatch(playlistCreateResponseSchema),
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
          const requestBody = {
            data: { type: 'playlists', attributes: body },
          }
          return {
            method: 'put',
            url: `playlists/${playlistId}`,
            body: requestBody,
          }
        },
        async onQueryStarted({ playlistId, body }, { dispatch, queryFulfilled, getState }) {
          const args = playlistsApi.util.selectCachedArgsForQuery(getState(), 'fetchPlaylists')
          const patchResults: { undo: () => void }[] = []

          args.forEach((arg) => {
            patchResults.push(
              dispatch(
                playlistsApi.util.updateQueryData(
                  // название эндпоинта, в котором нужно обновить кэш
                  'fetchPlaylists',
                  // аргументы для эндпоинта
                  { pageNumber: arg.pageNumber, pageSize: arg.pageSize, search: arg.search },
                  // `updateRecipe` - коллбэк для обновления закэшированного стейта мутабельным образом
                  (state) => {
                    const index = state.data.findIndex((playlist) => playlist.id === playlistId)
                    if (index !== -1) {
                      state.data[index].attributes = { ...state.data[index].attributes, ...body }
                    }
                  },
                ),
              ),
            )
          })

          try {
            await queryFulfilled
          } catch {
            patchResults.forEach((patchResult) => patchResult.undo())
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
        ...withZodCatch(imagesSchema),
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

//3.14
