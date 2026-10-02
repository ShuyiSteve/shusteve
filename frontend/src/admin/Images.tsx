import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, FolderOpen, Trash2 } from 'lucide-react'
import { adminDeleteUpload, adminListUploads, type UploadFile } from '../api/admin'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import { btnDanger, btnGhost } from './ui'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminImages() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyUrl, setBusyUrl] = useState<string | null>(null)
  const [onlyUnused, setOnlyUnused] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminListUploads()
      setFiles(res.files)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load images')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const remove = async (file: UploadFile) => {
    if (!window.confirm(`Delete "${file.name}"? This cannot be undone.`)) return

    setBusyUrl(file.url)
    setError('')
    try {
      await adminDeleteUpload(file.url)
      await load()
    } catch (e) {
      const status = (e as { status?: number })?.status
      if (status === 409) {
        // Backend refuses while the file is still referenced. Ask explicitly.
        if (window.confirm(`"${file.name}" is still used by a post or photo.\n\nDeleting it will leave a broken image on the site. Delete anyway?`)) {
          try {
            await adminDeleteUpload(file.url, true)
            await load()
          } catch (e2) {
            setError(e2 instanceof Error ? e2.message : 'Delete failed')
          }
        }
      } else {
        setError(e instanceof Error ? e.message : 'Delete failed')
      }
    } finally {
      setBusyUrl(null)
    }
  }

  const removeAllUnused = async () => {
    const unused = files.filter((f) => !f.used)
    if (unused.length === 0) return
    if (!window.confirm(`Delete ${unused.length} unused image${unused.length > 1 ? 's' : ''}? This cannot be undone.`)) return

    setBusyUrl('__bulk__')
    setError('')
    const failures: string[] = []
    for (const f of unused) {
      try {
        await adminDeleteUpload(f.url)
      } catch (e) {
        failures.push(`${f.name}: ${e instanceof Error ? e.message : 'failed'}`)
      }
    }
    setBusyUrl(null)
    if (failures.length > 0) setError(failures.join(' · '))
    await load()
  }

  if (loading) return <Spinner label="Loading images…" />

  const unusedCount = files.filter((f) => !f.used).length
  const usedCount = files.length - unusedCount
  const visible = onlyUnused ? files.filter((f) => !f.used) : files

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Images</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Every file uploaded for blog covers and inline pictures.
          </p>
        </div>
        <button
          type="button"
          onClick={removeAllUnused}
          disabled={unusedCount === 0 || busyUrl !== null}
          className={btnDanger}
        >
          <Trash2 size={15} />
          {busyUrl === '__bulk__' ? 'Deleting…' : `Delete unused (${unusedCount})`}
        </button>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full border hairline px-3 py-1 text-neutral-600 dark:text-neutral-300">
          {files.length} total
        </span>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
          {usedCount} in use
        </span>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400">
          {unusedCount} unused
        </span>
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-neutral-600 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={onlyUnused}
            onChange={(e) => setOnlyUnused(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700"
          />
          Unused only
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {visible.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={files.length === 0 ? 'No images uploaded yet' : 'Nothing unused'}
            hint={
              files.length === 0
                ? 'Add a photo from the post editor and it will show up here.'
                : 'Every stored image is still referenced by a post or photo.'
            }
          />
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((f) => (
            <li
              key={f.url}
              className={`overflow-hidden rounded-2xl border bg-white dark:bg-neutral-900 ${
                f.used ? 'hairline' : 'border-amber-300 dark:border-amber-900/70'
              }`}
            >
              <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-800">
                <img src={f.url} alt={f.name} loading="lazy" className="h-full w-full object-cover" />
                <span
                  className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                    f.used ? 'bg-emerald-600/90' : 'bg-amber-500/90'
                  }`}
                >
                  {f.used ? (
                    <>
                      <CheckCircle2 size={11} /> In use
                    </>
                  ) : (
                    'Unused'
                  )}
                </span>
              </div>
              <div className="p-4">
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400" title={f.name}>
                  {f.name}
                </p>
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                  {formatSize(f.size)} · {formatDate(f.modifiedAt)}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => remove(f)}
                    disabled={busyUrl !== null}
                    className={btnDanger}
                  >
                    <Trash2 size={13} />
                    {busyUrl === f.url ? 'Deleting…' : 'Delete'}
                  </button>
                  <a href={f.url} target="_blank" rel="noreferrer" className={btnGhost}>
                    <FolderOpen size={13} /> Open
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
