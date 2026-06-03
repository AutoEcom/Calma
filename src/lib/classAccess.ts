import { supabase } from './supabase'
import type { Tables } from './database.types'

export type UserAccessRow = Tables<'user_access'>

export async function fetchUserAccessForClass(
  memberId: string,
  classId: string,
): Promise<UserAccessRow | null> {
  const { data, error } = await supabase
    .from('user_access')
    .select('*')
    .eq('member_id', memberId)
    .eq('class_id', classId)
    .order('granted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('fetchUserAccessForClass', memberId, classId, error.message)
    return null
  }
  return data
}

/** True when a row exists and access was granted (any tier). */
export function hasAccess(row: UserAccessRow | null): boolean {
  return row != null && row.access_granted != null
}
