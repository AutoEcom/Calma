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

/** Coerce API values (number or string) into a non-negative integer. */
export function resolvePlayCount(stored: number | string | null | undefined): number {
  if (stored == null) return 0
  if (typeof stored === 'number') {
    return Number.isFinite(stored) ? Math.max(0, Math.floor(stored)) : 0
  }
  if (typeof stored === 'string') {
    const trimmed = stored.trim().replace(/,/g, '')
    if (!trimmed) return 0
    const n = Number.parseInt(trimmed, 10)
    return Number.isFinite(n) && n >= 0 ? n : 0
  }
  return 0
}

export function formatPlayCountLabel(stored: number | string | null | undefined): string {
  return `Plays: ${formatPlayCount(resolvePlayCount(stored))}`
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
