import { FileText, Image as ImageIcon, Plus, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminGetStats } from '../api/admin'
import Spinner from '../components/Spinner'
import { useFetch } from '../hooks/useFetch'
import type { Stats } from '../types'
import { card } from './ui'

const quick = [
  { to: '/admin/posts/new', label: 'New Blog Post', icon: FileText, hint: 'Write and publish a post' },
  { to: '/admin/photos', label: 'Upload Photos', icon: ImageIcon, hint: 'Add to the gallery' },
  { to: '/admin/vlogs', label: 'Add Vlog', icon: Youtube, hint: 'Link a YouTube video' },
]

export default function Dashboard() {
  const { data, loading } = useFetch<Stats>('/api/admin/stats')

  const stats = [
    { label: 'Blog Posts', value: data?.posts ?? 0, to: '/admin/posts', icon: FileText },
    { label: 'Photos', value: data?.photos ?? 0, to: '/admin/photos', icon: ImageIcon },
    { label: 'Vlogs', value: data?.vlogs ?? 0, to: '/admin/vlogs', icon: Youtube },
  ]

  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Manage everything on shuSteve from here.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className={`${card} card-hover`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{s.label}</p>
              <s.icon size={18} strokeWidth={1.75} className="text-neutral-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              {loading ? '—' : s.value}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        Quick actions
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {quick.map((q) => (
          <Link key={q.to} to={q.to} className={`${card} card-hover flex items-start gap-4`}>
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              <q.icon size={18} strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-50">{q.label}</span>
              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">{q.hint}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
