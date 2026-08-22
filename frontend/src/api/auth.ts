import { apiFetch } from './client'
import type { User } from '../types'

export interface LoginPayload {
  email: string
  password: string
}

export const login = (payload: LoginPayload) =>
  apiFetch<User>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) })

export const logout = () => apiFetch<void>('/api/auth/logout', { method: 'POST' })

export const me = () => apiFetch<User>('/api/auth/me')
