import { apiFetch } from './client'
import type { Photo } from '../types'

export const getPhotos = () => apiFetch<Photo[]>('/api/photos')
