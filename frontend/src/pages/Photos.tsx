import { useState } from 'react'
import Container from '../components/Container'
import EmptyState from '../components/EmptyState'
import PhotoLightbox from '../components/PhotoLightbox'
import Spinner from '../components/Spinner'
import { useFetch } from '../hooks/useFetch'
import { usePageMeta } from '../hooks/usePageMeta'
import type { Photo } from '../types'

export default function Photos() {
  usePageMeta('Photos', 'Photography by Steve Wang — travel, London, university and daily life.')
  const { data, loading, error } = useFetch<Photo[]>('/api/photos')
  const [index, setIndex] = useState<number | null>(null)

  return (
    <Container className="py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Gallery</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">
          Photos
        </h1>
        <p className="mt-4 text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
          Travel, London, university and daily life — a slowly growing collection.
        </p>
      </header>

      <div className="mt-12">
        {loading && <Spinner label="Loading photos…" />}
        {error && <EmptyState title="Couldn't load photos" hint={error} />}
        {!loading && !error && data && data.length === 0 && (
          <EmptyState title="No photos yet" hint="New photographs will appear here soon." />
        )}
        {!loading && !error && data && data.length > 0 && (
          <div className="masonry">
            {data.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setIndex(i)}
                className="group block w-full overflow-hidden rounded-xl border hairline bg-white text-left dark:bg-neutral-900"
              >
                <div className="overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title || photo.description || 'Photo'}
                    loading="lazy"
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                {(photo.title || photo.location) && (
                  <div className="px-4 py-3">
                    {photo.title && (
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{photo.title}</p>
                    )}
                    {photo.location && (
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{photo.location}</p>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <PhotoLightbox photos={data ?? []} index={index} onClose={() => setIndex(null)} onNavigate={setIndex} />
    </Container>
  )
}
