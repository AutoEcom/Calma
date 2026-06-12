import { parseAudioCredits, type AudioCredits } from '../../lib/audioSanctuary'
import { LocalizedPrice } from '../pricing/LocalizedPrice'
import { formatPlayCountLabel } from '../../lib/playCount'
import { cn } from '../../lib/utils'

type MetaProps = {
  durationMinutes: number
  playCount?: number | string | null
  frequency?: string | null
  className?: string
  /** Dark marketing surfaces (guest detail card). */
  dark?: boolean
}

export function SanctuaryMetaBadges({
  durationMinutes,
  playCount,
  frequency,
  className,
  dark = false,
}: MetaProps) {
  const pill = dark
    ? 'rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/50'
    : 'rounded-full bg-slate-200/80 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-neutral-400'

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <span className={pill}>{formatPlayCountLabel(playCount)}</span>
      <span className={pill}>{durationMinutes} min</span>
      {frequency && (
        <span
          className={cn(
            pill,
            dark && 'border-[#2dd4bf]/20 text-[#2dd4bf]/80',
          )}
        >
          {frequency}
        </span>
      )}
    </div>
  )
}

type GuideLineProps = {
  guide: string
  priceInCents?: number
  showPrice?: boolean
  className?: string
}

export function SanctuaryGuidePriceLine({
  guide,
  priceInCents = 0,
  showPrice = true,
  className,
}: GuideLineProps) {
  return (
    <p className={cn('text-sm text-white/55', className)}>
      Guided by {guide}
      {showPrice && priceInCents > 0 ? (
        <>
          <span className="text-white/35"> · </span>
          <LocalizedPrice
            cents={priceInCents}
            className="font-medium text-white/90"
          />
        </>
      ) : null}
    </p>
  )
}

export function formatAtmosphereStudio(credits: AudioCredits): string | null {
  const studio = credits.studio?.trim()
  if (!studio) return null
  return `Atmosphere Studio: ${studio}`
}

export function AtmosphereStudioCredit({
  rawCredits,
  className,
}: {
  rawCredits: unknown
  className?: string
}) {
  const credits = parseAudioCredits(rawCredits)
  const line = formatAtmosphereStudio(credits)
  if (!line) return null
  return (
    <p className={cn('text-center text-sm text-white/45', className)}>{line}</p>
  )
}
