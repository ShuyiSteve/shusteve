import { apiFetch } from './client'
import type { Vlog } from '../types'

export const getVlogs = () => apiFetch<Vlog[]>('/api/vlogs')
