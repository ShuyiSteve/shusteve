import { apiFetch } from './client'
import type { Post } from '../types'

export const getPosts = () => apiFetch<Post[]>('/api/posts')
export const getPost = (slug: string) => apiFetch<Post>(`/api/posts/${encodeURIComponent(slug)}`)
