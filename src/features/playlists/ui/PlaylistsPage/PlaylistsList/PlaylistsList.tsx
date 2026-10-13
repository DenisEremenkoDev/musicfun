import { EditPlaylistForm } from '@/features/playlists/ui/PlaylistsPage/EditPlatlistForm/EditPlatlistForm.tsx'
import { PlaylistItem } from '@/features/playlists/ui/PlaylistsPage/PlaylistItem/PlaylistItem.tsx'
import s from './PlaylistsList.module.css'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { PlaylistData, UpdatePlaylistArgs } from '@/features/playlists/api/playlistsApi.types.ts'
import { useDeletePlaylistMutation } from '@/features/playlists/api/playlistsApi.tsx'

type Props = {
  playlist: PlaylistData[]
  isPlaylistLoading: boolean
}

export const PlaylistsList = ({ isPlaylistLoading, playlist }: Props) => {
  const [playlistId, setPlaylistId] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm<UpdatePlaylistArgs>()
  const [deletePlaylist] = useDeletePlaylistMutation()


  const deletePlaylistHandler = (playlistId: string) => {
    if (confirm('Are you sure you want to delete?')) {
      deletePlaylist(playlistId)
    }
  }

  const editPlaylistHandler = (playlist: PlaylistData | null) => {
    if (playlist) {
      setPlaylistId(playlist.id)
      reset({
        title: playlist?.attributes.title,
        description: playlist?.attributes.description,
        tagIds: playlist?.attributes.tags.map((tag) => tag.id),
      })
    } else {
      setPlaylistId(null)
    }
  }

  return (
    <div className={s.items}>
      {!playlist.length && !isPlaylistLoading && <h2>Playlists not found</h2>}
      {playlist.map((playlist) => {
        const isEditing = playlist.id === playlistId

        return (
          <div className={s.item} key={playlist.id}>
            {isEditing ? (
              <EditPlaylistForm
                playlistId={playlist.id}
                setPlaylistId={setPlaylistId}
                editPlaylist={editPlaylistHandler}
                handleSubmit={handleSubmit}
                register={register}
              />
            ) : (
              <PlaylistItem
                playlist={playlist}
                deletePlaylistHandler={deletePlaylistHandler}
                editPlaylistHandler={editPlaylistHandler}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
