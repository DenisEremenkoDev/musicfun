import type { SocketEvents } from '@/common/constants'
import { getSocked } from '@/common/socket/getSocked.ts'

export const subscribeToEvent = <T>(event: SocketEvents, callback: (data: T) => void) => {
  const socket = getSocked()

  socket.on(event, callback)

  return () => {
    socket.off(event, callback)
  }
}
