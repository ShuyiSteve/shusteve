import { Link } from 'react-router-dom'
import type { Post } from '../types'
import { readingTime } from '../hooks/useReadingTime'

export default function PostCard({ post }: { post: Post }) {
  const date = new Date(post.createdAt)
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="card-hover group flex flex-col overflow-hidden rounded-2xl border hairline bg-white dark:bg-neutral-900"
    >
      {post.coverImageUrl ? (
        <div className="aspect-[16/9] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-400 dark:from-neutral-800 dark:to-neutral-900 dark:text-neutral-600">
          <span className="font-serif text-2xl italic">shuSteve</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          {post.category && (
            <span className="rounded-full border hairline px-2.5 py-0.5 font-medium">{post.category}</span>
          )}
          <span>
            {date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          <span>·</span>
          <span>{readingTime(post.content)} min read</span>
        </div>

        <h3 className="text-lg font-semibold leading-snug tracking-tight text-neutral-900 dark:text-neutral-50">
          {post.title}
        </h3>

        {post.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            {post.description}
          </p>
        )}

        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">
          Read more
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </Link>
  )
}
