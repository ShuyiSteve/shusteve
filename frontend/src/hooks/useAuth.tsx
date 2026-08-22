import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { me } from '../api/auth'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const u = await me()
      setUser(u)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return <AuthContext.Provider value={{ user, loading, refresh }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
