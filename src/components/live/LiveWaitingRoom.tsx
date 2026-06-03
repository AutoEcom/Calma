import { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

type Props = {
  scheduledAt: string
  coverImageUrl: string | null
  className?: string
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export function LiveWaitingRoom({ scheduledAt, coverImageUrl, className }: Props) {
  const target = useMemo(() => new Date(scheduledAt).getTime(), [scheduledAt])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const remaining = Math.max(0, target - now)
  const hours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  const sessionStarted = remaining <= 0

  return (
    <div
      className={cn(
        'relative flex min-h-[min(70vh,520px)] flex-col items-center justify-center overflow-hidden rounded-2xl',
        className,
      )}
    >
      {coverImageUrl ? (
        <>
          <img
            src={coverImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full scale-105 object-cover blur-2xl brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--page-bg)]/40 via-black/50 to-[var(--page-bg)]/90" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#042f2e]/40 to-[#020617]" />
      )}

      <div className="relative z-10 mx-auto max-w-lg px-6 py-12 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-teal-700 bg-slate-900 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[#2dd4bf] shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Waiting room
        </div>

        <p className="text-lg font-medium leading-relaxed text-white/95 sm:text-xl">
          The instructor is preparing the studio.
          <br />
          Grab your mat and get ready!
        </p>

        <p className="mt-4 text-sm text-white/60">
          {sessionStarted
            ? 'The session time has started — the live feed will appear when the instructor goes live.'
            : 'Live video begins at the scheduled time.'}
        </p>

        <div className="mt-10">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--accent)]">
            {sessionStarted ? 'On air soon' : 'Starts in'}
          </p>
          <div className="mt-4 font-mono text-4xl font-semibold tabular-nums tracking-tight text-white sm:text-5xl">
            {sessionStarted ? (
              <span className="animate-pulse text-[var(--accent)]">Stand by…</span>
            ) : (
              <>
                {hours > 0 && <span>{pad(hours)}:</span>}
                {pad(minutes)}:{pad(seconds)}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
