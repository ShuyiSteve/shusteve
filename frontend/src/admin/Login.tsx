import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { btnPrimary, inputCls, labelCls } from './ui'

export default function Login() {
  const { user, loading, refresh } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to="/admin" replace />
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ email, password })
      await refresh()
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-light px-4 dark:bg-paper-dark">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border hairline bg-white p-8 shadow-xl shadow-neutral-900/5 dark:bg-neutral-900 dark:shadow-black/30">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            shuSteve Admin
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Sign in to manage your content.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className={labelCls}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="password" className={labelCls}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className={`${btnPrimary} w-full justify-center`}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-neutral-400">
          <a href="/" className="hover:text-neutral-600 dark:hover:text-neutral-300">
            ← Back to site
          </a>
        </p>
      </div>
    </div>
  )
}
