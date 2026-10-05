export type User = {
  id: string
  name: string
}

export type Tag = {
  id: string
  name: string
}

export type Image = {
  type: 'original'
  width: number
  height: number
  fileSize: number
  url: string
}

export type Images = {
  main: Image[]
}
