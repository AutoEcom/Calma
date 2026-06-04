import { slugifyTitle } from './slugify'
import { supabase } from './supabase'
import type { Tables } from './database.types'

export type AdminBundleRow = Pick<
  Tables<'bundles'>,
  'id' | 'slug' | 'title' | 'description' | 'price_in_cents' | 'image_url' | 'is_published' | 'badge'
>

export type BundleFormInput = {
  title: string
  description: string
  priceEuros: string
  imageUrl: string | null
  isPublished: boolean
  customSlug: string
  badge: string
}

/** All bundles (published and draft) — requires studio admin RLS. */
export async function fetchAdminBundles(): Promise<AdminBundleRow[]> {
  const { data, error } = await supabase
    .from('bundles')
    .select('id, slug, title, description, price_in_cents, image_url, is_published, badge')
    .order('title', { ascending: true })

  if (error) {
    console.error('fetchAdminBundles', error)
    return []
  }
  return (data ?? []) as AdminBundleRow[]
}

export async function fetchBundleIdsForClass(classId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('bundle_classes')
    .select('bundle_id')
    .eq('class_id', classId)

  if (error) {
    console.error('fetchBundleIdsForClass', error)
    return []
  }
  return (data ?? []).map((r) => r.bundle_id)
}

/** Replace junction rows for one meditation with the selected bundle ids (order preserved). */
export async function syncClassBundleAssignments(
  classId: string,
  selectedBundleIds: readonly string[],
): Promise<{ error: string | null }> {
  const { error: delErr } = await supabase.from('bundle_classes').delete().eq('class_id', classId)
  if (delErr) return { error: delErr.message }

  if (selectedBundleIds.length === 0) return { error: null }

  const rows = selectedBundleIds.map((bundle_id, sort_order) => ({
    bundle_id,
    class_id: classId,
    sort_order,
  }))

  const { error: insErr } = await supabase.from('bundle_classes').insert(rows)
  return { error: insErr?.message ?? null }
}

export function bundleSlugFromForm(title: string, customSlug: string): string {
  const trimmed = customSlug.trim()
  if (trimmed) return trimmed.toLowerCase().replace(/\s+/g, '-')
  return slugifyTitle(title) || `bundle-${Date.now()}`
}

export function bundlePayloadFromForm(
  form: BundleFormInput,
  editingId: string | null,
  draftId: string,
) {
  const euros = Number(form.priceEuros)
  const price_in_cents = Math.round(euros * 100)
  const slug = bundleSlugFromForm(form.title, form.customSlug)

  return {
    id: editingId ?? draftId,
    slug,
    title: form.title.trim(),
    description: form.description.trim() || null,
    price_in_cents,
    image_url: form.imageUrl,
    is_published: form.isPublished,
    badge: form.badge.trim() || null,
    updated_at: new Date().toISOString(),
  }
}

export async function saveAdminBundle(
  form: BundleFormInput,
  editingId: string | null,
  draftId: string,
): Promise<{ error: string | null; id: string }> {
  const euros = Number(form.priceEuros)
  if (!form.title.trim()) return { error: 'Title is required.', id: editingId ?? draftId }
  if (!Number.isFinite(euros) || euros < 0) return { error: 'Enter a valid price.', id: editingId ?? draftId }

  const row = bundlePayloadFromForm(form, editingId, draftId)
  const id = row.id

  if (editingId) {
    const { id: _id, ...patch } = row
    const { error } = await supabase.from('bundles').update(patch).eq('id', editingId)
    return { error: error?.message ?? null, id: editingId }
  }

  const { error } = await supabase.from('bundles').insert(row)
  return { error: error?.message ?? null, id }
}

export async function deleteAdminBundle(bundleId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('bundles').delete().eq('id', bundleId)
  return { error: error?.message ?? null }
}
