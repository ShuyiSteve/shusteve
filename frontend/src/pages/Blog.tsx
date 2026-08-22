import { useMemo, useState } from 'react'
import Container from '../components/Container'
import EmptyState from '../components/EmptyState'
import PostCard from '../components/PostCard'
import Spinner from '../components/Spinner'
import { useFetch } from '../hooks/useFetch'
import { usePageMeta } from '../hooks/usePageMeta'
import type { Post } from '../types'

export default function Blog() {
  usePageMeta('Blog', 'Thoughts on programming, computer science, university and life.')
  const { data, loading, error } = useFetch<Post[]>('/api/posts')
  const [category, setCategory] = useState<string>('All')

  const categories = useMemo(() => {
    const set = new Set<string>()
    data?.forEach((p) => p.category && set.add(p.category))
    return ['All', ...Array.from(set)]
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    return category === 'All' ? data : data.filter((p) => p.category === category)
  }, [data, category])

  return (
    <Container className="py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Writing</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">
          Blog
        </h1>
        <p className="mt-4 text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
          Notes on programming, computer science, university, projects and whatever I'm thinking about.
        </p>
      </header>

      {categories.length > 1 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                  : 'hairline text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-12">
        {loading && <Spinner label="Loading posts…" />}
        {error && <EmptyState title="Couldn't load posts" hint={error} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState title="No posts yet" hint="Check back soon — the first post is on its way." />
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
