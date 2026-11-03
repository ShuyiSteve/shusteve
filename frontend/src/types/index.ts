export interface Photo {
  id: number
  title: string
  description: string
  imageUrl: string
  location: string
  takenAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Vlog {
  id: number
  title: string
  description: string
  youtubeUrl: string
  thumbnailUrl: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  email: string
}

export interface Stats {
  posts: number
  photos: number
  vlogs: number
}
