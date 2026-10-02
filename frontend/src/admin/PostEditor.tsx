import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, ImagePlus, PenLine, Upload, X } from 'lucide-react'
import { adminCreatePost, adminGetPosts, adminUpdatePost, adminUploadImage } from '../api/admin'
import Markdown from '../components/Markdown'
import Spinner from '../components/Spinner'
import type { Post } from '../types'
import { btnGhost, btnPrimary, card, inputCls, labelCls } from './ui'

const empty = {
  title: '',
  slug: '',
  description: '',
  category: '',
  coverImageUrl: '',
  content: '',
  published: false,
}

// Keep in sync with allowedImageTypes in backend/controllers/photos.go
const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp,image/gif'

export default function PostEditor() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(empty)
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState<'cover' | 'content' | null>(null)
  const [uploadError, setUploadError] = useState('')

  const coverInput = useRef<HTMLInputElement>(null)
  const contentInput = useRef<HTMLInputElement>(null)
  const contentArea = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isEdit) return
    adminGetPosts()
      .then((posts) => {
        const p = posts.find((x) => String(x.id) === id)
        if (p) {
          setForm({
            title: p.title,
            slug: p.slug,
            description: p.description,
            category: p.category,
            coverImageUrl: p.coverImageUrl,
            content: p.content,
            published: p.published,
          })
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load post'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (key: keyof typeof empty, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  // Insert a Markdown snippet at the textarea cursor (appends if unfocused).
  const insertIntoContent = (snippet: string) => {
    const el = contentArea.current
    if (!el) {
      setForm((f) => ({ ...f, content: `${f.content}${snippet}` }))
      return
    }
    const start = el.selectionStart ?? form.content.length
    const end = el.selectionEnd ?? start
    setForm((f) => ({ ...f, content: f.content.slice(0, start) + snippet + f.content.slice(end) }))
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + snippet.length
      el.setSelectionRange(pos, pos)
    })
  }

  const uploadFile = async (file: File, target: 'cover' | 'content') => {
    setUploadError('')
    setUploading(target)
    try {
      const { url } = await adminUploadImage(file)
      if (target === 'cover') {
        setForm((f) => ({ ...f, coverImageUrl: url }))
      } else {
        const alt = file.name.replace(/\.[^.]+$/, '')
        insertIntoContent(`\n![${alt}](${url})\n`)
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(null)
      if (coverInput.current) coverInput.current.value = ''
      if (contentInput.current) contentInput.current.value = ''
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isEdit) {
        await adminUpdatePost(Number(id), form)
      } else {
        await adminCreatePost(form)
      }
      navigate('/admin/posts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      setSaving(false)
    }
  }

  if (loading) {
    return <Spinner label="Loading post…" />
  }

  return (
    <div>
      <header className="flex items-center justify-between gap-4">
        <div>
          <Link to="/admin/posts" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50">
            <ArrowLeft size={15} /> All posts
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            {isEdit ? 'Edit Post' : 'New Post'}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className={preview ? btnPrimary : btnGhost}
        >
          {preview ? <PenLine size={15} /> : <Eye size={15} />}
          {preview ? 'Editor' : 'Preview'}
        </button>
      </header>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div className={card}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className={labelCls}>Title *</label>
              <input
                id="title"
                required
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="My First Blog"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="slug" className={labelCls}>Slug <span className="text-neutral-400">(optional, auto-generated)</span></label>
              <input
                id="slug"
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="my-first-blog"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="category" className={labelCls}>Category</label>
              <input
                id="category"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                placeholder="Programming"
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className={labelCls}>Description</label>
              <input
                id="description"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="A short summary shown on the blog index."
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="cover" className={labelCls}>Cover Image</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="cover"
                  value={form.coverImageUrl}
                  onChange={(e) => set('coverImageUrl', e.target.value)}
                  placeholder="https://… or /uploads/cover.jpg"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => coverInput.current?.click()}
                  disabled={uploading !== null}
                  className={`${btnGhost} shrink-0 justify-center`}
                >
                  <Upload size={15} />
                  {uploading === 'cover' ? 'Uploading…' : 'Choose photo'}
                </button>
              </div>
              <input
                ref={coverInput}
                type="file"
                accept={ACCEPTED_IMAGES}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) uploadFile(f, 'cover')
                }}
              />
              {form.coverImageUrl && (
                <div className="mt-3 flex flex-wrap items-start gap-3">
                  <img
                    src={form.coverImageUrl}
                    alt="Cover preview"
                    className="aspect-[16/9] w-full max-w-sm rounded-lg border hairline object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => set('coverImageUrl', '')}
                    className={btnGhost}
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
              )}
              <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                JPG / PNG / WebP / GIF，最大 10MB。封面会被裁成 16:9，建议用 1920×1080。
              </p>
            </div>
          </div>
        </div>

        {uploadError && <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>}

        {preview ? (
          <div className={card}>
            <div className="mb-4 border-b hairline pb-4">
              <h2 className="font-serif text-2xl font-medium text-neutral-900 dark:text-neutral-50">{form.title || 'Untitled'}</h2>
              <p className="mt-1 text-sm text-neutral-500">{form.description || 'No description'}</p>
            </div>
            <Markdown content={form.content || '*Nothing written yet.*'} />
          </div>
        ) : (
          <div className={card}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="content" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Content (Markdown) *
              </label>
              <button
                type="button"
                onClick={() => contentInput.current?.click()}
                disabled={uploading !== null}
                className={btnGhost}
              >
                <ImagePlus size={15} />
                {uploading === 'content' ? 'Uploading…' : 'Insert photo'}
              </button>
            </div>
            <input
              ref={contentInput}
              type="file"
              accept={ACCEPTED_IMAGES}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) uploadFile(f, 'content')
              }}
            />
            <textarea
              ref={contentArea}
              id="content"
              required
              rows={18}
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              placeholder={'# My First Blog\n\nToday I started building my personal website.\n\n## Golang\n\nI\'m currently learning…'}
              className={`${inputCls} font-mono text-sm leading-relaxed`}
            />
            <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
              照片会插入到光标所在位置，写成 Markdown 语法 ![](/uploads/xxx.jpg)。换行后写 *斜体* 可以做图注。
            </p>
          </div>
        )}

        <div className={`${card} flex flex-wrap items-center justify-between gap-4`}>
          <label htmlFor="published" className="flex cursor-pointer items-center gap-3">
            <input
              id="published"
              type="checkbox"
              checked={form.published}
              onChange={(e) => set('published', e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-700"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Publish</span>
          </label>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex gap-2">
            <Link to="/admin/posts" className={btnGhost}>Cancel</Link>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
