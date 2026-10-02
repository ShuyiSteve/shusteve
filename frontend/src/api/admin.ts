import { apiFetch } from './client'
import type { Post, Photo, Vlog, Stats } from '../types'

export const adminGetStats = () => apiFetch<Stats>('/api/admin/stats')

// Upload a blog image (cover or inline). Unlike the photos endpoints this does
// not create a gallery record — it just stores the file and returns its URL.
export const adminUploadImage = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return apiFetch<{ url: string }>('/api/admin/uploads', { method: 'POST', body: fd })
}

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

export interface UploadFile {
  name: string
  url: string
  size: number
  modifiedAt: string
  used: boolean
}

export interface UploadsResponse {
  files: UploadFile[]
  total: number
  usedCount: number
  unusedCount: number
}

export const adminListUploads = () => apiFetch<UploadsResponse>('/api/admin/uploads')

// force = delete even when a post/photo still references the file.
export const adminDeleteUpload = (url: string, force = false) =>
  apiFetch<void>(`/api/admin/uploads${force ? '?force=true' : ''}`, {
    method: 'DELETE',
    body: JSON.stringify({ url }),
  })
