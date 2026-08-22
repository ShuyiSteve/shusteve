import { useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { Photo } from '../types'

export default function PhotoLightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: Photo[]
  index: number | null
  onClose: () => void
  onNavigate: (next: number) => void
}) {
  const open = index !== null
  const photo = index !== null ? photos[index] : null

  const prev = useCallback(() => {
    if (index === null) return
    onNavigate((index - 1 + photos.length) % photos.length)
  }, [index, photos.length, onNavigate])

  const next = useCallback(() => {
    if (index === null) return
    onNavigate((index + 1) % photos.length)
  }, [index, photos.length, onNavigate])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, prev, next])

  return (
    <AnimatePresence>
      {open && photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={photo.title || 'Photo preview'}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X size={20} />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
          >
            <ChevronRight size={22} />
          </button>

          <figure
            className="flex max-h-[90vh] max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photo.imageUrl}
              alt={photo.title || photo.description || 'Photo'}
              className="max-h-[76vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
            />
            {(photo.title || photo.location || photo.takenAt) && (
              <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm text-neutral-300">
                {photo.title && <span className="font-medium text-white">{photo.title}</span>}
                {photo.location && <span>{photo.location}</span>}
                {photo.takenAt && (
                  <span>{new Date(photo.takenAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}</span>
                )}
              </figcaption>
            )}
          </figure>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
