import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { adminCreateVlog, adminDeleteVlog, adminGetVlogs, adminUpdateVlog } from '../api/admin'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import { useFetch } from '../hooks/useFetch'
import type { Vlog } from '../types'
import { btnDanger, btnGhost, btnPrimary, card, inputCls, labelCls } from './ui'

const toDateInput = (s?: string | null) => (s ? s.slice(0, 10) : '')

const empty = { title: '', description: '', youtubeUrl: '', thumbnailUrl: '', publishedAt: '' }

export default function AdminVlogs() {
  const { data, loading, error, reload } = useFetch<Vlog[]>('/api/admin/vlogs')
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const [editing, setEditing] = useState<Vlog | null>(null)
  const [editForm, setEditForm] = useState(empty)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.youtubeUrl) {
      setFormError('YouTube URL is required.')
      return
    }
    setBusy(true); setFormError('')
    try {
      await adminCreateVlog({ ...form, publishedAt: form.publishedAt || null })
      setForm(empty)
      reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async (vlog: Vlog) => {
    if (!window.confirm(`Delete "${vlog.title}"?`)) return
    try {
      await adminDeleteVlog(vlog.id)
      reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const onSaveEdit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setFormError('')
    try {
      await adminUpdateVlog(editing!.id, { ...editForm, publishedAt: editForm.publishedAt || null })
      setEditing(null)
      reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  const field = (key: keyof typeof empty) => ({
    value: form[key],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Vlogs</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Add and manage your YouTube videos. Only metadata is stored — videos stay on YouTube.
        </p>
      </header>

      <form onSubmit={onSubmit} className={`${card} mt-8`}>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          <Plus size={16} /> Add vlog
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="vtitle" className={labelCls}>Title *</label>
            <input id="vtitle" required {...field('title')} placeholder="My first vlog" className={inputCls} />
          </div>
          <div>
            <label htmlFor="vdate" className={labelCls}>Published date</label>
            <input id="vdate" type="date" {...field('publishedAt')} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="vurl" className={labelCls}>YouTube URL *</label>
            <input id="vurl" required {...field('youtubeUrl')} placeholder="https://www.youtube.com/watch?v=…" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="vthumb" className={labelCls}>Thumbnail URL (optional — auto-detected from YouTube if empty)</label>
            <input id="vthumb" {...field('thumbnailUrl')} placeholder="https://i.ytimg.com/vi/…/hqdefault.jpg" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="vdesc" className={labelCls}>Description</label>
            <textarea id="vdesc" rows={3} {...field('description')} placeholder="A short description." className={inputCls} />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Saving…' : 'Save vlog'}</button>
          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
        </div>
      </form>

      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">All vlogs</h2>
        <div className="mt-4">
          {loading && <Spinner />}
          {error && <EmptyState title="Couldn't load vlogs" hint={error} />}
          {!loading && !error && data && data.length === 0 && (
            <EmptyState title="No vlogs yet" hint="Add your first YouTube video above." />
          )}
          {!loading && !error && data && data.length > 0 && (
            <ul className="space-y-3">
              {data.map((vlog) => (
                <li key={vlog.id} className={`${card} flex flex-wrap items-center justify-between gap-4 !p-4`}>
                  <div className="flex min-w-0 items-center gap-4">
                    {vlog.thumbnailUrl && (
                      <img src={vlog.thumbnailUrl} alt="" loading="lazy" className="h-14 w-24 shrink-0 rounded-md border hairline object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-neutral-900 dark:text-neutral-50">{vlog.title}</p>
                      <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{vlog.youtubeUrl}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setEditing(vlog); setEditForm({ title: vlog.title, description: vlog.description, youtubeUrl: vlog.youtubeUrl, thumbnailUrl: vlog.thumbnailUrl, publishedAt: toDateInput(vlog.publishedAt) }) }} className={btnGhost}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button type="button" onClick={() => onDelete(vlog)} className={btnDanger}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={onSaveEdit} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border hairline bg-white p-6 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Edit vlog</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X size={17} />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="etitle" className={labelCls}>Title</label>
                <input id="etitle" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label htmlFor="eurl" className={labelCls}>YouTube URL</label>
                <input id="eurl" value={editForm.youtubeUrl} onChange={(e) => setEditForm({ ...editForm, youtubeUrl: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label htmlFor="ethumb" className={labelCls}>Thumbnail URL</label>
                <input id="ethumb" value={editForm.thumbnailUrl} onChange={(e) => setEditForm({ ...editForm, thumbnailUrl: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label htmlFor="edate" className={labelCls}>Published date</label>
                <input id="edate" type="date" value={editForm.publishedAt} onChange={(e) => setEditForm({ ...editForm, publishedAt: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label htmlFor="edesc" className={labelCls}>Description</label>
                <textarea id="edesc" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={inputCls} />
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
