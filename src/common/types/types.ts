
import z from 'zod'
import { coverSchema, currentUserReactionSchema, imagesSchema, tagSchema, userSchema } from '@/common/shemas'

export type Tag = z.infer<typeof tagSchema>
export type User = z.infer<typeof userSchema>
export type Cover = z.infer<typeof coverSchema>
export type Images = z.infer<typeof imagesSchema>
export type CurrentUserReaction = z.infer<typeof currentUserReactionSchema>




// export type User = {
//   id: string
//   name: string
// }
//
// export type Tag = {
//   id: string
//   name: string
// }
//
// export type Image = {
//   type: 'original'
//   width: number
//   height: number
//   fileSize: number
//   url: string
// }
//
// export type Images = {
//   main: Image[]
// }
