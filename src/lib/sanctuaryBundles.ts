import { supabase } from './supabase'

export type SanctuaryBundleOffer = {
  id: string
  title: string
  price_in_cents: number
  badge: string | null
  description: string | null
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
