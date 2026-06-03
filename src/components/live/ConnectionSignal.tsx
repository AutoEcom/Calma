import { Signal, SignalHigh, SignalLow } from 'lucide-react'
import { badgeOnImagePill } from '../../lib/solidBadge'
import { cn } from '../../lib/utils'

export type ConnectionQuality = 'good' | 'fair' | 'poor'

const CONFIG: Record<
  ConnectionQuality,
  { label: string; className: string; Icon: typeof SignalHigh }
> = {
  good: {
    label: 'Excellent connection',
    className: 'text-emerald-400',
    Icon: SignalHigh,
  },
  fair: {
    label: 'Buffering',
    className: 'text-amber-400',
    Icon: Signal,
  },
  poor: {
    label: 'Weak connection',
    className: 'text-red-400',
    Icon: SignalLow,
  },
}

export function ConnectionSignal({ quality }: { quality: ConnectionQuality }) {
  const { label, className, Icon } = CONFIG[quality]
  return (
    <div
      className={cn(
        badgeOnImagePill,
        'px-2.5 py-1 text-[10px] font-medium',
        className,
      )}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function ConnectionSignalDot({ quality }: { quality: ConnectionQuality }) {
  const color =
    quality === 'good'
      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
      : quality === 'fair'
        ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]'
        : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]'
  return (
    <span
      className={cn('h-2 w-2 rounded-full', color)}
      title={CONFIG[quality].label}
      aria-label={CONFIG[quality].label}
    />
  )
}
