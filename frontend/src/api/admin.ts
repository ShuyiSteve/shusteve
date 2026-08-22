import { apiFetch } from './client'
import type { Post, Photo, Vlog, Stats } from '../types'

export const adminGetStats = () => apiFetch<Stats>('/api/admin/stats')

export const adminGetPosts = () => apiFetch<Post[]>('/api/admin/posts')
export const adminCreatePost = (post: Partial<Post>) =>
  apiFetch<Post>('/api/admin/posts', { method: 'POST', body: JSON.stringify(post) })
export const adminUpdatePost = (id: number, post: Partial<Post>) =>
  apiFetch<Post>(`/api/admin/posts/${id}`, { method: 'PUT', body: JSON.stringify(post) })
export const adminDeletePost = (id: number) =>
  apiFetch<void>(`/api/admin/posts/${id}`, { method: 'DELETE' })

export const adminGetPhotos = () => apiFetch<Photo[]>('/api/admin/photos')
export const adminCreatePhoto = (form: FormData) =>
  apiFetch<Photo>('/api/admin/photos', { method: 'POST', body: form })
export const adminUpdatePhoto = (id: number, form: FormData) =>
  apiFetch<Photo>(`/api/admin/photos/${id}`, { method: 'PUT', body: form })
export const adminDeletePhoto = (id: number) =>
  apiFetch<void>(`/api/admin/photos/${id}`, { method: 'DELETE' })

export const adminGetVlogs = () => apiFetch<Vlog[]>('/api/admin/vlogs')
export const adminCreateVlog = (vlog: Partial<Vlog>) =>
  apiFetch<Vlog>('/api/admin/vlogs', { method: 'POST', body: JSON.stringify(vlog) })
export const adminUpdateVlog = (id: number, vlog: Partial<Vlog>) =>
  apiFetch<Vlog>(`/api/admin/vlogs/${id}`, { method: 'PUT', body: JSON.stringify(vlog) })
export const adminDeleteVlog = (id: number) =>
  apiFetch<void>(`/api/admin/vlogs/${id}`, { method: 'DELETE' })
