import { AUDIO_SANCTUARY_SELECT } from './audioSanctuary'
import { supabase } from './supabase'
import type { Tables } from './database.types'

export type SanctuaryBundleOffer = {
  id: string
  title: string
  price_in_cents: number
  badge: string | null
  description: string | null
}

export type BundleClassPreview = Tables<'classes'> & { play_count?: number | null }

export type SanctuaryBundleCatalogItem = {
  id: string
  slug: string
  title: string
  description: string | null
  price_in_cents: number
  badge: string | null
  image_url: string | null
  protocolCount: number
  classes: BundleClassPreview[]
}

/** First published bundle that includes this meditation (package upsell). */
export async function fetchPrimaryBundleForClass(
  classId: string,
): Promise<SanctuaryBundleOffer | null> {
  const { data: links, error: linkErr } = await supabase
    .from('bundle_classes')
    .select('bundle_id, sort_order')
    .eq('class_id', classId)
    .order('sort_order', { ascending: true })
    .limit(1)

  if (linkErr || !links?.length) return null

  const { data: bundle, error: bundleErr } = await supabase
    .from('bundles')
    .select('id, title, price_in_cents, badge, description')
    .eq('id', links[0].bundle_id)
    .eq('is_published', true)
    .maybeSingle()

  if (bundleErr || !bundle) return null
  return bundle as SanctuaryBundleOffer
}

/** Published bundles with linked sanctuary classes (many-to-many). */
export async function fetchPublishedBundlesCatalog(): Promise<SanctuaryBundleCatalogItem[]> {
  const { data: bundles, error } = await supabase
    .from('bundles')
    .select('id, slug, title, description, price_in_cents, badge, image_url')
    .eq('is_published', true)
    .order('title', { ascending: true })

  if (error || !bundles?.length) {
    if (error) console.error('fetchPublishedBundlesCatalog', error)
    return []
  }

  const bundleIds = bundles.map((b) => b.id)
  const { data: links, error: linkErr } = await supabase
    .from('bundle_classes')
    .select('bundle_id, class_id, sort_order')
    .in('bundle_id', bundleIds)
    .order('sort_order', { ascending: true })

  if (linkErr) {
    console.error('fetchPublishedBundlesCatalog links', linkErr)
    return bundles.map((b) => ({
      ...b,
      protocolCount: 0,
      classes: [],
    }))
  }

  const classIds = [...new Set((links ?? []).map((l) => l.class_id))]
  const classById = new Map<string, BundleClassPreview>()

  if (classIds.length > 0) {
    const { data: classes, error: classErr } = await supabase
      .from('classes')
      .select(AUDIO_SANCTUARY_SELECT)
      .in('id', classIds)

    if (classErr) {
      console.error('fetchPublishedBundlesCatalog classes', classErr)
    } else {
      for (const row of classes ?? []) {
        classById.set(row.id, row as BundleClassPreview)
      }
    }
  }

  const linksByBundle = new Map<string, typeof links>()
  for (const link of links ?? []) {
    const list = linksByBundle.get(link.bundle_id) ?? []
    list.push(link)
    linksByBundle.set(link.bundle_id, list)
  }

  return bundles.map((bundle) => {
    const bundleLinks = linksByBundle.get(bundle.id) ?? []
    const classes = bundleLinks
      .map((l) => classById.get(l.class_id))
      .filter((c): c is BundleClassPreview => c != null)

    return {
      id: bundle.id,
      slug: bundle.slug,
      title: bundle.title,
      description: bundle.description,
      price_in_cents: bundle.price_in_cents,
      badge: bundle.badge,
      image_url: bundle.image_url,
      protocolCount: classes.length,
      classes,
    }
  })
}
