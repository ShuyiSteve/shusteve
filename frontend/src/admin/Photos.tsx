import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { adminCreatePhoto, adminDeletePhoto, adminGetPhotos, adminUpdatePhoto } from '../api/admin'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import { useFetch } from '../hooks/useFetch'
import type { Photo } from '../types'
import { btnDanger, btnGhost, btnPrimary, card, inputCls, labelCls } from './ui'

const toDateInput = (s?: string | null) => (s ? s.slice(0, 10) : '')

export default function AdminPhotos() {
  const { data, loading, error, reload } = useFetch<Photo[]>('/api/admin/photos')
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [takenAt, setTakenAt] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')

  const [editing, setEditing] = useState<Photo | null>(null)
  const [editFile, setEditFile] = useState<File | null>(null)
  const [editPreview, setEditPreview] = useState('')

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const resetForm = () => {
    setTitle(''); setDescription(''); setLocation(''); setTakenAt('')
    setFile(null); setPreviewUrl('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const onPick = (f: File | null) => {
    setFile(f)
    setPreviewUrl(f ? URL.createObjectURL(f) : '')
  }

  const onPickEdit = (f: File | null) => {
    setEditFile(f)
    setEditPreview(f ? URL.createObjectURL(f) : '')
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) {
      setFormError('Please choose an image to upload.')
      return
    }
    setBusy(true); setFormError('')
    try {
      const fd = new FormData()
      fd.append('photo', file)
      fd.append('title', title)
      fd.append('description', description)
      fd.append('location', location)
      if (takenAt) fd.append('takenAt', takenAt)
      await adminCreatePhoto(fd)
      resetForm()
      reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async (photo: Photo) => {
    if (!window.confirm(`Delete "${photo.title || 'this photo'}"?`)) return
    try {
      await adminDeletePhoto(photo.id)
      reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const onSaveEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setBusy(true); setFormError('')
    try {
      const fd = new FormData()
      if (editFile) fd.append('photo', editFile)
      fd.append('title', editing.title || '')
      fd.append('description', editing.description || '')
      fd.append('location', editing.location || '')
      if (editing.takenAt) fd.append('takenAt', toDateInput(editing.takenAt))
      await adminUpdatePhoto(editing.id, fd)
      setEditing(null); setEditFile(null); setEditPreview('')
      reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Photos</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Upload, edit and delete gallery photos.</p>
      </header>

      <form onSubmit={onSubmit} className={`${card} mt-8`}>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          <Plus size={16} /> Upload photo
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="photo" className={labelCls}>Image file * (JPG, PNG, WebP)</label>
            <input
              ref={fileRef}
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-neutral-500 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-200 dark:text-neutral-400 dark:file:bg-neutral-800 dark:file:text-neutral-200"
            />
          </div>
          {previewUrl && (
            <div className="sm:col-span-2">
              <img src={previewUrl} alt="Preview" className="max-h-56 rounded-lg border hairline object-contain" />
            </div>
          )}
          <div>
            <label htmlFor="ptitle" className={labelCls}>Title</label>
            <input id="ptitle" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Sunset in London" />
          </div>
          <div>
            <label htmlFor="plocation" className={labelCls}>Location</label>
            <input id="plocation" value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="London, UK" />
          </div>
          <div>
            <label htmlFor="ptaken" className={labelCls}>Date taken</label>
            <input id="ptaken" type="date" value={takenAt} onChange={(e) => setTakenAt(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="pdesc" className={labelCls}>Description</label>
            <input id="pdesc" value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} placeholder="A short caption" />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? 'Uploading…' : 'Upload photo'}
          </button>
          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
        </div>
      </form>

      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">All photos</h2>
        <div className="mt-4">
          {loading && <Spinner />}
          {error && <EmptyState title="Couldn't load photos" hint={error} />}
          {!loading && !error && data && data.length === 0 && (
            <EmptyState title="No photos yet" hint="Upload your first photo above." />
          )}
          {!loading && !error && data && data.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((photo) => (
                <li key={photo.id} className="overflow-hidden rounded-2xl border hairline bg-white dark:bg-neutral-900">
                  <img src={photo.imageUrl} alt={photo.title || 'Photo'} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  <div className="p-4">
                    <p className="truncate font-medium text-neutral-900 dark:text-neutral-50">{photo.title || 'Untitled'}</p>
                    <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {photo.location || 'No location'}
                      {photo.takenAt ? ` · ${new Date(photo.takenAt).getFullYear()}` : ''}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => { setEditing(photo); setEditFile(null); setEditPreview('') }} className={btnGhost}>
                        <Pencil size={13} /> Edit
                      </button>
                      <button type="button" onClick={() => onDelete(photo)} className={btnDanger}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <form
            onSubmit={onSaveEdit}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border hairline bg-white p-6 dark:bg-neutral-900"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Edit photo</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <img src={editPreview || editing.imageUrl} alt="Current" className="max-h-48 rounded-lg border hairline object-contain" />
              </div>
              <div>
                <label htmlFor="editfile" className={labelCls}>Replace image (optional)</label>
                <input id="editfile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => onPickEdit(e.target.files?.[0] ?? null)} className="block w-full text-sm text-neutral-500" />
              </div>
              <div>
                <label htmlFor="etitle" className={labelCls}>Title</label>
                <input id="etitle" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label htmlFor="edesc" className={labelCls}>Description</label>
                <input id="edesc" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label htmlFor="eloc" className={labelCls}>Location</label>
                <input id="eloc" value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label htmlFor="etaken" className={labelCls}>Date taken</label>
                <input id="etaken" type="date" value={toDateInput(editing.takenAt)} onChange={(e) => setEditing({ ...editing, takenAt: e.target.value || null })} className={inputCls} />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Saving…' : 'Save changes'}</button>
              <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
              {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
