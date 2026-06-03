import { useEffect, useMemo, useState } from 'react'

type Props = {
  targetIso: string
  className?: string
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export function SessionCountdown({ targetIso, className }: Props) {
  const target = useMemo(() => new Date(targetIso).getTime(), [targetIso])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const remaining = Math.max(0, target - now)
  const done = remaining <= 0

  const days = Math.floor(remaining / 86400000)
  const hours = Math.floor((remaining % 86400000) / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  if (done) return null

  const cells = [
    { label: 'Days', value: days },
    { label: 'Hours', value: hours },
    { label: 'Min', value: pad(minutes) },
    { label: 'Sec', value: pad(seconds) },
  ]

  return (
    <div
      className={
        className ??
        'rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--surface)] to-[var(--page-bg)] p-6'
      }
    >
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
        Session starts in
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
        {cells.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--page-bg)]/80 px-2 py-3 text-center shadow-inner shadow-black/40"
          >
            <div className="font-mono text-xl font-semibold tabular-nums text-[var(--text)] sm:text-2xl">
              {c.value}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
