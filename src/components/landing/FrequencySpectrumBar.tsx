import { cn } from '../../lib/utils'

/** Solfeggio-style band labels aligned with sanctuary protocol spectrum (174Hz–963Hz). */
const BANDS = [
  { hz: '174', label: 'Foundation' },
  { hz: '285', label: 'Cellular' },
  { hz: '396', label: 'Liberation' },
  { hz: '417', label: 'Subconscious' },
  { hz: '528', label: 'Repair' },
  { hz: '639', label: 'Connection' },
  { hz: '741', label: 'Expression' },
  { hz: '852', label: 'Intuition' },
  { hz: '963', label: 'Unity' },
] as const

export function FrequencySpectrumBar({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]/90">
        Multi-frequency neural regulation · 174Hz → 963Hz
      </p>
      <div className="flex flex-wrap gap-1.5">
        {BANDS.map((b) => (
          <span
            key={b.hz}
            title={`${b.hz}Hz · ${b.label}`}
            className="rounded-md border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-2 py-1 font-mono text-[10px] font-medium text-slate-700 dark:text-neutral-300"
          >
            {b.hz}
          </span>
        ))}
      </div>
      <p className="text-xs leading-relaxed tracking-wide text-slate-500 dark:text-neutral-500">
        DNA repair · cellular harmony · parasympathetic regulation across the full vibration
        spectrum — not a single-tone shortcut.
      </p>
    </div>
  )
}
