import { FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminDeletePost, adminGetPosts } from '../api/admin'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import { useFetch } from '../hooks/useFetch'
import type { Post } from '../types'
import { btnDanger, btnGhost, btnPrimary, card } from './ui'

export default function Posts() {
  const { data, loading, error, reload } = useFetch<Post[]>('/api/admin/posts')

  const onDelete = async (post: Post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    try {
      await adminDeletePost(post.id)
      reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete')
    }
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Blog Posts</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Create, edit and delete posts.</p>
        </div>
        <Link to="/admin/posts/new" className={btnPrimary}>
          <Plus size={15} /> New Post
        </Link>
      </header>

      <div className="mt-8">
        {loading && <Spinner />}
        {error && <EmptyState title="Couldn't load posts" hint={error} />}
        {!loading && !error && data && data.length === 0 && (
          <EmptyState title="No posts yet" hint="Write your first post to get started." />
        )}
        {!loading && !error && data && data.length > 0 && (
          <ul className="space-y-3">
            {data.map((post) => (
              <li
                key={post.id}
                className={`${card} flex flex-wrap items-center justify-between gap-4 !p-4 sm:!p-5`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                    <FileText size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-900 dark:text-neutral-50">{post.title}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>/blog/{post.slug}</span>
                      <span>·</span>
                      {post.category && <span>{post.category}</span>}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          post.published
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/admin/posts/${post.id}/edit`} className={btnGhost}>
                    <Pencil size={14} /> Edit
                  </Link>
                  <button type="button" onClick={() => onDelete(post)} className={btnDanger}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
