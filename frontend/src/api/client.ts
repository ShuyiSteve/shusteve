import { API_BASE_URL } from '../config'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {})
  const isForm = options.body instanceof FormData
  if (options.body && !isForm) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    const msg =
      (data as { error?: string; message?: string })?.error ||
      (data as { error?: string; message?: string })?.message ||
      `Request failed (${res.status})`
    throw new ApiError(msg, res.status)
  }

  return data as T
}
