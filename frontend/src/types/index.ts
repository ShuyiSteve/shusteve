export interface Post {
  id: number
  title: string
  slug: string
  description: string
  content: string
  coverImageUrl: string
  category: string
  published: boolean
  createdAt: string
  updatedAt: string
}

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

export interface User {
  id: number
  email: string
}

export interface Stats {
  posts: number
  photos: number
}
