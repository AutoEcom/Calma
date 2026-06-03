import { supabase } from './supabase'

/** Rows in user_access with access_granted set, per class (RPC; works for anon). */
export async function fetchBookedCountsByClassIds(
  classIds: string[],
): Promise<Record<string, number>> {
  const empty: Record<string, number> = Object.fromEntries(classIds.map((id) => [id, 0]))
  if (classIds.length === 0) return {}

  const { data, error } = await supabase.rpc('class_booked_counts', {
    p_ids: classIds,
  })

  if (error) {
    console.warn('class_booked_counts', error.message)
    return empty
  }

  const map = { ...empty }
  for (const row of data ?? []) {
    const id = row.class_id as string | undefined
    if (id) map[id] = Number(row.booked ?? 0)
  }
  return map
}

export function spotsRemaining(maxCapacity: number, booked: number): number {
  return Math.max(0, maxCapacity - booked)
}
