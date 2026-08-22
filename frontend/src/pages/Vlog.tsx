import { ExternalLink, Youtube } from 'lucide-react'
import Container from '../components/Container'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import { useFetch } from '../hooks/useFetch'
import { usePageMeta } from '../hooks/usePageMeta'
import type { Vlog } from '../types'

function youtubeThumb(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)
  return match ? `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg` : ''
}

export default function Vlog() {
  usePageMeta('Vlog', 'Video vlogs by Steve Wang on YouTube.')
  const { data, loading, error } = useFetch<Vlog[]>('/api/vlogs')

  return (
    <Container className="py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Video</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">
          Vlog
        </h1>
        <p className="mt-4 text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
          Short films and videos — hosted on YouTube.
        </p>
      </header>

      <div className="mt-12">
        {loading && <Spinner label="Loading vlogs…" />}
        {error && <EmptyState title="Couldn't load vlogs" hint={error} />}
        {!loading && !error && data && data.length === 0 && (
          <EmptyState title="No vlogs yet" hint="The first video is in the works." />
        )}
        {!loading && !error && data && data.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((vlog) => {
              const thumb = vlog.thumbnailUrl || youtubeThumb(vlog.youtubeUrl)
              const date = vlog.publishedAt ? new Date(vlog.publishedAt) : null
              return (
                <a
                  key={vlog.id}
                  href={vlog.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="card-hover group flex flex-col overflow-hidden rounded-2xl border hairline bg-white dark:bg-neutral-900"
                >
                  <div className="relative aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={vlog.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-400 dark:text-neutral-600">
                        <Youtube size={40} strokeWidth={1.25} />
                      </div>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                        <Youtube size={24} fill="currentColor" strokeWidth={0} />
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold leading-snug tracking-tight text-neutral-900 dark:text-neutral-50">
                      {vlog.title}
                    </h3>
                    {vlog.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                        {vlog.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                      <span>
                        {date ? date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium">
                        Watch <ExternalLink size={12} />
                      </span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </Container>
  )
}
