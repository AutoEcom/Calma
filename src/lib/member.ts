import { supabase } from './supabase'
import type { Tables } from './database.types'

export type MemberRow = Tables<'members'>

export type AppRole = 'student' | 'instructor' | 'admin'

/** Maps DB `members` to product roles. Schema has `is_admin` only; staff = instructor + admin. */
export function roleFromMember(member: MemberRow | null): AppRole {
  if (!member) return 'student'
  if (member.is_admin) return 'admin'
  return 'student'
}

export function isStaff(member: MemberRow | null): boolean {
  return Boolean(member?.is_admin)
}

export async function fetchMember(userId: string): Promise<MemberRow | null> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('fetchMember', error.message)
    return null
  }
  return data
}
