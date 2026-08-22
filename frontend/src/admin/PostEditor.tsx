import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, PenLine } from 'lucide-react'
import { adminCreatePost, adminGetPosts, adminUpdatePost } from '../api/admin'
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

export default function PostEditor() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(empty)
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
              <label htmlFor="cover" className={labelCls}>Cover Image URL</label>
              <input
                id="cover"
                value={form.coverImageUrl}
                onChange={(e) => set('coverImageUrl', e.target.value)}
                placeholder="https://… or /uploads/cover.jpg"
                className={inputCls}
              />
            </div>
          </div>
        </div>

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
            <label htmlFor="content" className={labelCls}>Content (Markdown) *</label>
            <textarea
              id="content"
              required
              rows={18}
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              placeholder={'# My First Blog\n\nToday I started building my personal website.\n\n## Golang\n\nI\'m currently learning…'}
              className={`${inputCls} font-mono text-sm leading-relaxed`}
            />
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
