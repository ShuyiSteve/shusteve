import { ExternalLink, FileText, Image as ImageIcon, LayoutDashboard, LogOut, Youtube } from 'lucide-react'
import { Link, Navigate, NavLink, Outlet } from 'react-router-dom'
import { logout } from '../api/auth'
import Spinner from '../components/Spinner'
import { useAuth } from '../hooks/useAuth'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/posts', label: 'Blog Posts', icon: FileText },
  { to: '/admin/photos', label: 'Photos', icon: ImageIcon },
  { to: '/admin/vlogs', label: 'Vlogs', icon: Youtube },
]

export default function AdminLayout() {
  const { user, loading, refresh } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore — clear the session locally regardless
    }
    await refresh()
  }

  return (
    <div className="min-h-screen bg-paper-light dark:bg-paper-dark">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r hairline bg-white dark:bg-neutral-950 md:flex">
          <div className="border-b hairline px-6 py-5">
            <Link to="/admin" className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              shuSteve
            </Link>
            <p className="mt-0.5 text-xs text-neutral-400">Admin</p>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50'
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50'
                  }`
                }
              >
                <n.icon size={17} strokeWidth={1.75} />
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="space-y-1 border-t hairline p-3">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
            >
              <ExternalLink size={17} strokeWidth={1.75} />
              View site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
            >
              <LogOut size={17} strokeWidth={1.75} />
              Log out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b hairline bg-white/90 backdrop-blur-xl dark:bg-neutral-950/90 md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <Link to="/admin" className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                shuSteve Admin
              </Link>
              <button type="button" onClick={handleLogout} className="text-sm text-neutral-500">
                Log out
              </button>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium ${
                      isActive
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="p-5 sm:p-8 lg:p-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
