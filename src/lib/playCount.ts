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

export function resolvePlayCount(stored: number | null | undefined, classId: string): number {
  if (typeof stored === 'number' && stored > 0) return stored
  let h = 0
  for (let i = 0; i < classId.length; i++) {
    h = (h * 31 + classId.charCodeAt(i)) >>> 0
  }
  return 80_000 + (h % 160_000)
}
