import { supabase } from './supabase'

/** Direct class purchase or bundle that includes this meditation. */
export async function memberHasAudioAccess(
  memberId: string,
  classId: string,
): Promise<boolean> {
  const { data: direct } = await supabase
    .from('user_access')
    .select('id')
    .eq('member_id', memberId)
    .eq('class_id', classId)
    .not('access_granted', 'is', null)
    .limit(1)
    .maybeSingle()

  if (direct) return true

  const { data: links } = await supabase
    .from('bundle_classes')
    .select('bundle_id')
    .eq('class_id', classId)

  const bundleIds = (links ?? []).map((r) => r.bundle_id)
  if (bundleIds.length === 0) return false

  const { data: bundleAccess } = await supabase
    .from('user_bundle_access')
    .select('id')
    .eq('member_id', memberId)
    .in('bundle_id', bundleIds)
    .limit(1)
    .maybeSingle()

  return !!bundleAccess
}
