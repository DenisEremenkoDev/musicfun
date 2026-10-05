import type { CurrentUserReaction } from '@/common/enums'
import type { Images, Tag, User } from '@/common/types'

// Общие типы
export type PlaylistData = {
  id: string
  type: 'playlists'
  attributes: PlaylistAttributes
}

// Arguments: то, что передаёшь в мутацию из компонента
export type CreatePlaylistArgs = {
  title: string
  description: string
}

// Arguments: то, что передаёшь в мутацию из компонента
export type UpdatePlaylistArgs = {
  title: string
  description: string
  tagIds?: string[]
}

// Request body: то, что реально уходит на сервер
export type UpdatePlaylistRequest = {
  data: {
    type: 'playlists'
    attributes: UpdatePlaylistArgs
  }
}



export type PlaylistAttributes = {
  title: string
  description: string
  addedAt: string
  updatedAt: string
  order: number
  user: User
  images: Images
  tags: Tag[]
  likesCount: number
  dislikesCount: number
  currentUserReaction: CurrentUserReaction
  tracksCount: number
  duration: number
}

export type PlaylistMeta = {
  page: number
  pageSize: number
  totalCount: number
  pagesCount: number
}

// Responses
export type PlaylistsResponse = {
  data: PlaylistData[]
  meta: PlaylistMeta
}

// Ответ на POST /playlists (201): один объект, без meta
export type CreatePlaylistResponse = {
  data: PlaylistData
}

// Arguments
export type FetchPlaylistsArgs = {
  pageNumber?: number
  pageSize?: number
  search?: string
  sortBy?: 'addedAt' | 'likesCount'
  sortDirection?: 'asc' | 'desc'
  tagsIds?: string[]
  userId?: string
  trackId?: string
}

