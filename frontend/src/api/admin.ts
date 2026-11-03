import { apiFetch } from './client'
import type { Photo, Vlog, Stats } from '../types'

export const adminGetStats = () => apiFetch<Stats>('/api/admin/stats')

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
