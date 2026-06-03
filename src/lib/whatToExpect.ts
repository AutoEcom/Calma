/**
 * Normalizes `what_to_expect` from text[], jsonb, JSON string, or { items | bullets }.
 */
export function normalizeWhatToExpect(raw: unknown): string[] {
  if (raw == null) return []

  if (Array.isArray(raw)) {
    return raw
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  if (typeof raw === 'string') {
    const t = raw.trim()
    if (!t) return []
    try {
      const parsed: unknown = JSON.parse(t)
      return normalizeWhatToExpect(parsed)
    } catch {
      return t
        .split(/\r?\n/)
        .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
        .filter(Boolean)
    }
  }

  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.items)) return normalizeWhatToExpect(o.items)
    if (Array.isArray(o.bullets)) return normalizeWhatToExpect(o.bullets)
    if (Array.isArray(o.expect)) return normalizeWhatToExpect(o.expect)
  }

  return []
}
