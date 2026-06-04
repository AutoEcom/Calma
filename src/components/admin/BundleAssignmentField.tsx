import { Package } from 'lucide-react'
import type { AdminBundleRow } from '../../lib/adminBundles'
import { formatEurFromCents } from '../../lib/formatPrice'
import { cn } from '../../lib/utils'

type Props = {
  bundles: AdminBundleRow[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  loading?: boolean
}

export function BundleAssignmentField({ bundles, selectedIds, onChange, loading }: Props) {
  const selected = new Set(selectedIds)

  function toggle(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(
      bundles.filter((b) => next.has(b.id)).map((b) => b.id),
    )
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--accent)]/20 bg-[var(--page-bg)]/50 p-5">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <Package className="h-4 w-4 text-[var(--accent)]" />
          Assign to bundles (packs)
        </h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Many-to-many: a meditation can appear in multiple sanctuary bundles. Saved with the
          meditation.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading bundles…</p>
      ) : bundles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">
          No bundles yet. Create packs in the{' '}
          <span className="font-medium text-[var(--accent)]">Bundles (Packs)</span> admin tab.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {bundles.map((bundle) => {
            const checked = selected.has(bundle.id)
            return (
              <li key={bundle.id}>
                <label
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition',
                    checked
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_20px_-12px_rgba(45,212,191,0.5)]'
                      : 'border-[var(--border)] bg-[var(--surface)]/60 hover:border-[var(--accent)]/40',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(bundle.id)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[var(--text)]">
                      {bundle.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                      {formatEurFromCents(bundle.price_in_cents)}
                      {!bundle.is_published && (
                        <span className="ml-2 uppercase tracking-wide text-amber-600 dark:text-amber-400">
                          · Draft
                        </span>
                      )}
                    </span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
