import {
  Check,
  ImageIcon,
  Loader2,
  Package,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AdminTabNav } from '../components/admin/AdminTabNav'
import {
  deleteAdminBundle,
  fetchAdminBundles,
  saveAdminBundle,
  type AdminBundleRow,
} from '../lib/adminBundles'
import { supabase } from '../lib/supabase'
import { useAuth } from '../providers/AuthProvider'
import { cn } from '../lib/utils'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function defaultForm() {
  return {
    title: '',
    description: '',
    priceEuros: '49',
    imageUrl: null as string | null,
    isPublished: false,
    customSlug: '',
    badge: '',
  }
}

export function AdminBundlesPage() {
  const { user, role, loading: authLoading } = useAuth()

  const [bundlesList, setBundlesList] = useState<AdminBundleRow[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftId, setDraftId] = useState(() => crypto.randomUUID())
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const effectiveId = editingId ?? draftId

  const loadList = useCallback(async () => {
    setListLoading(true)
    const list = await fetchAdminBundles()
    setBundlesList(list)
    setListLoading(false)
  }, [])

  useEffect(() => {
    void loadList()
  }, [loadList])

  function resetFormForNew() {
    setEditingId(null)
    setDraftId(crypto.randomUUID())
    setForm(defaultForm())
    setError(null)
    setImageError(null)
  }

  function openEdit(row: AdminBundleRow) {
    setEditingId(row.id)
    setForm({
      title: row.title,
      description: row.description ?? '',
      priceEuros: (row.price_in_cents / 100).toFixed(2),
      imageUrl: row.image_url,
      isPublished: row.is_published,
      customSlug: row.slug,
      badge: row.badge ?? '',
    })
    setError(null)
    setImageError(null)
  }

  async function uploadCoverFile(file: File) {
    setImageError(null)
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image must be 5 MB or smaller.')
      return
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'
    const path = `bundles/${effectiveId}/cover-${Date.now()}.${safeExt}`

    setImageUploading(true)
    const { error: upErr } = await supabase.storage.from('class-media').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })
    setImageUploading(false)

    if (upErr) {
      setImageError(upErr.message)
      return
    }

    const { data: pub } = supabase.storage.from('class-media').getPublicUrl(path)
    setForm((f) => ({ ...f, imageUrl: pub.publicUrl }))
  }

  async function handleDelete(row: AdminBundleRow) {
    if (
      !window.confirm(
        `Delete bundle “${row.title}”? Linked meditations will be unlinked (not deleted).`,
      )
    ) {
      return
    }
    setDeletingId(row.id)
    setError(null)
    const { error: delErr } = await deleteAdminBundle(row.id)
    setDeletingId(null)
    if (delErr) {
      setError(delErr)
      return
    }
    if (editingId === row.id) resetFormForNew()
    await loadList()
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const { error: saveErr, id } = await saveAdminBundle(form, editingId, draftId)
    setSaving(false)
    if (saveErr) {
      setError(saveErr)
      return
    }
    await loadList()
    if (editingId) {
      const row = (await fetchAdminBundles()).find((b) => b.id === editingId)
      if (row) openEdit(row)
    } else {
      const row = (await fetchAdminBundles()).find((b) => b.id === id)
      if (row) openEdit(row)
      else resetFormForNew()
    }
  }

  if (authLoading) {
    return (
      <div className="flex justify-center py-24 text-[var(--text-muted)]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)]" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: '/admin/bundles' }} />
  }

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <header className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-8 shadow-[0_24px_80px_-48px_rgba(45,212,191,0.35)]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-warm)] to-transparent"
          aria-hidden
        />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              Studio admin
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">
              Bundle (pack) manager
            </h1>
            <p className="max-w-xl text-sm text-[var(--text-muted)]">
              Create sanctuary packs sold via Stripe. Assign meditations to bundles from each
              meditation editor.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetFormForNew}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent)]/15 px-4 py-2 text-sm font-semibold text-[var(--accent)]"
            >
              <Plus className="h-4 w-4" />
              New bundle
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--on-accent)] hover:opacity-90"
            >
              View site
            </Link>
          </div>
        </div>
      </header>

      <AdminTabNav />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr]">
        <aside className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Bundles
            </h2>
            {listLoading && <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />}
          </div>
          <div className="max-h-[min(70vh,520px)] space-y-2 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2">
            {bundlesList.length === 0 && !listLoading ? (
              <p className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">
                No bundles yet.
              </p>
            ) : (
              bundlesList.map((b) => (
                <div
                  key={b.id}
                  className={cn(
                    'relative flex w-full rounded-xl border transition',
                    editingId === b.id
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-transparent bg-[var(--page-bg)]/50 hover:border-[var(--border)]',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openEdit(b)}
                    className="flex min-w-0 flex-1 flex-col gap-1 px-3 py-3 pr-10 text-left"
                  >
                    <span className="line-clamp-2 text-sm font-medium text-[var(--text)]">
                      {b.title}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {b.is_published ? 'Published' : 'Draft'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(b)}
                    disabled={deletingId === b.id}
                    className="absolute right-2 top-2 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                    aria-label="Delete bundle"
                  >
                    {deletingId === b.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <Package className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">
              {editingId ? 'Edit bundle' : 'New bundle'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetFormForNew}
                className="ml-auto text-xs font-medium text-[var(--accent)] hover:underline"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
            <label className="block text-sm">
              <span className="text-[var(--text-muted)]">Title</span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="block text-sm">
              <span className="text-[var(--text-muted)]">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                className="mt-1.5 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-[var(--text-muted)]">Price (EUR)</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.priceEuros}
                  onChange={(e) => setForm((f) => ({ ...f, priceEuros: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
              </label>
              <label className="block text-sm">
                <span className="text-[var(--text-muted)]">URL slug</span>
                <input
                  value={form.customSlug}
                  onChange={(e) => setForm((f) => ({ ...f, customSlug: e.target.value }))}
                  placeholder="auto from title"
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 font-mono text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="text-[var(--text-muted)]">Badge (optional)</span>
              <input
                value={form.badge}
                onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                placeholder="e.g. Bundle · 4 Protocols"
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--page-bg)]/50 px-4 py-3">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                className="h-4 w-4 rounded text-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text)]">
                Published — visible in Sanctuary Bundles tab &amp; checkout
              </span>
            </label>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <ImageIcon className="h-4 w-4 text-[var(--accent)]" />
                Cover image
              </h3>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragActive(false)
                  const f = e.dataTransfer.files?.[0]
                  if (f?.type.startsWith('image/')) void uploadCoverFile(f)
                }}
                className={cn(
                  'rounded-2xl border-2 border-dashed px-6 py-8 text-center transition',
                  dragActive
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border)]',
                )}
              >
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--accent)]">
                  {imageUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload cover
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      e.target.value = ''
                      if (f) void uploadCoverFile(f)
                    }}
                  />
                </label>
                {imageError && <p className="mt-2 text-xs text-red-400">{imageError}</p>}
              </div>
              {form.imageUrl && (
                <div className="flex gap-4">
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="h-24 w-40 rounded-lg object-cover ring-1 ring-[var(--border)]"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, imageUrl: null }))}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Remove image
                  </button>
                </div>
              )}
            </section>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || imageUploading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] py-4 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving bundle…
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Save bundle
                </>
              )}
            </button>
          </form>

          <p className="mt-6 flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--page-bg)]/40 px-4 py-3 text-xs text-[var(--text-muted)]">
            <Pencil className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
            Link meditations to this pack from{' '}
            <Link to="/admin/classes" className="font-medium text-[var(--accent)] hover:underline">
              Classes &amp; meditations
            </Link>{' '}
            → open a meditation → Assign to bundles.
          </p>
        </div>
      </div>
    </div>
  )
}
