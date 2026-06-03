/** Format listen counts for marketing display (e.g. 134.4k). */
export function formatPlayCount(count: number): string {
  if (!Number.isFinite(count) || count < 0) return '0'
  if (count >= 1_000_000) {
    const m = count / 1_000_000
    return m >= 10 ? `${Math.round(m)}M` : `${m.toFixed(1)}M`
  }
  if (count >= 10_000) {
    return `${(count / 1_000).toFixed(1)}k`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}k`
  }
  return count.toLocaleString()
}

/** Stored Supabase value; defaults to 0 when unset. */
export function resolvePlayCount(stored: number | null | undefined): number {
  if (typeof stored === 'number' && Number.isFinite(stored) && stored >= 0) return stored
  return 0
}

export function parseDisplayPlayCountInput(raw: string): { value: number; error?: string } {
  const trimmed = raw.trim().replace(/,/g, '')
  if (!trimmed) return { value: 0 }
  const n = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(n) || n < 0) {
    return { value: 0, error: 'Display plays must be a non-negative whole number.' }
  }
  return { value: n }
}
