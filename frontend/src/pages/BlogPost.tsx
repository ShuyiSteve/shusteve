import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Container from '../components/Container'
import Markdown from '../components/Markdown'
import Spinner from '../components/Spinner'
import { useFetch } from '../hooks/useFetch'
import { usePageMeta } from '../hooks/usePageMeta'
import { readingTime } from '../hooks/useReadingTime'
import type { Post } from '../types'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, loading, error } = useFetch<Post>(`/api/posts/${slug}`)
  usePageMeta(post?.title ?? 'Blog', post?.description)

  if (loading) {
    return (
      <Container className="py-24">
        <Spinner label="Loading post…" />
      </Container>
    )
  }

  if (error || !post) {
    return (
      <Container className="py-24">
        <p className="font-serif text-4xl font-medium text-neutral-900 dark:text-neutral-50">Post not found</p>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400">
          It may have been unpublished or moved.
        </p>
        <Link
          to="/blog"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-200"
        >
          <ArrowLeft size={15} /> All posts
        </Link>
      </Container>
    )
  }

  const date = new Date(post.createdAt)

  return (
    <Container className="py-14 sm:py-20">
      <article className="mx-auto max-w-2xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
        >
          <ArrowLeft size={15} /> All posts
        </Link>

        <header className="mt-8">
          {post.category && (
            <span className="rounded-full border hairline px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
              {post.category}
            </span>
          )}
          <h1 className="mt-4 font-serif text-4xl font-medium leading-tight tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
            <span>
              {date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span>·</span>
            <span>{readingTime(post.content)} min read</span>
          </div>
        </header>

        {post.coverImageUrl && (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="mt-10 aspect-[16/9] w-full rounded-2xl border hairline object-cover"
          />
        )}

        <div className="mt-10">
          <Markdown content={post.content} />
        </div>
      </article>
    </Container>
  )
}
