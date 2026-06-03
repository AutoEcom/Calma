import { BarChart3 } from 'lucide-react'
import { formatPlayCountLabel } from '../../lib/playCount'
import { cn } from '../../lib/utils'

type Props = {
  count: number | string | null | undefined
  variant?: 'muted' | 'onDark' | 'pill' | 'prominent'
  className?: string
  showIcon?: boolean
}

export function PlayCountStat({
  count,
  variant = 'muted',
  className,
  showIcon = true,
}: Props) {
  const label = formatPlayCountLabel(count)
  if (variant === 'pill') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md',
          className,
        )}
      >
        {showIcon && <BarChart3 className="h-3 w-3 shrink-0 text-[#2dd4bf]" aria-hidden />}
        {label}
      </span>
    )
  }

  if (variant === 'prominent') {
    return (
      <p
        className={cn(
          'inline-flex items-center gap-2 text-sm font-semibold tabular-nums tracking-wide text-[#2dd4bf]',
          className,
        )}
      >
        {showIcon && <BarChart3 className="h-4 w-4 shrink-0" aria-hidden />}
        <span>{label}</span>
      </p>
    )
  }

  if (variant === 'onDark') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium tabular-nums tracking-wide text-neutral-300',
          className,
        )}
      >
        {showIcon && <BarChart3 className="h-3 w-3 shrink-0 text-[#2DD4BF]/90" aria-hidden />}
        {label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium tabular-nums tracking-wide text-neutral-500 dark:text-neutral-400',
        className,
      )}
    >
      {showIcon && <BarChart3 className="h-3 w-3 shrink-0 text-[var(--accent)]" aria-hidden />}
      {label}
    </span>
  )
}
