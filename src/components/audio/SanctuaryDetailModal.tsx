import { Clock, Headphones, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CATEGORY_LABELS, parseAudioCredits, type AudioSanctuaryCategory } from '../../lib/audioSanctuary'
import { sanctuaryDetailPath } from '../../lib/classKind'
import { PlayCountStat } from './PlayCountStat'
import { formatEurFromCents } from '../../lib/formatPrice'
import { sanctuaryCoverUrl } from '../../lib/sanctuaryCover'
import type { Tables } from '../../lib/database.types'
import { GlassModal } from '../ui/GlassModal'
import { cn } from '../../lib/utils'

type Row = Tables<'classes'> & { play_count?: number | null }

type Props = {
  row: Row | null
  onClose: () => void
}

export function SanctuaryDetailModal({ row, onClose }: Props) {
  if (!row) return null

  const cover = sanctuaryCoverUrl(row)
  const credits = parseAudioCredits(row.audio_credits)
  const guide = credits.guide ?? row.instructor_name
  const comingSoon = row.sanctuary_status === 'coming_soon'
  const category =
    row.audio_sanctuary_category &&
    CATEGORY_LABELS[row.audio_sanctuary_category as AudioSanctuaryCategory]

  return (
    <GlassModal open onClose={onClose} title={row.title}>
      <div className="space-y-5">
        {cover && (
          <div className="overflow-hidden rounded-2xl">
            <img src={cover} alt="" className="aspect-[16/9] w-full object-cover" />
          </div>
        )}
        <div className="flex flex-wrap gap-2 text-xs">
          <PlayCountStat
            count={row.play_count}
            variant="muted"
            className="rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-[var(--accent)] dark:text-[var(--accent)]"
          />
          <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-slate-700 dark:bg-white/10 dark:text-neutral-300">
            {row.duration_minutes} min
          </span>
          {category && (
            <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-slate-700 dark:bg-white/10 dark:text-neutral-300">
              {category}
            </span>
          )}
          {comingSoon && (
            <span className="rounded-full bg-slate-800 px-2.5 py-1 font-semibold uppercase tracking-wide text-white">
              Coming soon
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-neutral-400">
          <Headphones className="mr-1.5 inline h-4 w-4 text-[var(--accent)]" />
          {guide}
          {credits.frequency ? ` · ${credits.frequency}` : ''}
        </p>
        {row.description && (
          <p className="text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
            {row.description}
          </p>
        )}
        {row.usage_tip && (
          <p className="rounded-xl bg-slate-100/90 px-4 py-3 text-sm text-slate-600 dark:bg-white/[0.06] dark:text-neutral-400">
            <Sparkles className="mr-1.5 inline h-4 w-4 text-[var(--accent)]" />
            {row.usage_tip}
          </p>
        )}
        <div className="flex flex-col gap-2 border-t border-slate-200/80 pt-4 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
            {formatEurFromCents(row.price_in_cents)}
            <span className="ml-2 font-normal text-slate-500 dark:text-neutral-500">
              <Clock className="mr-0.5 inline h-3.5 w-3.5" />
              Dolby Atmos · HLS
            </span>
          </p>
          <Link
            to={sanctuaryDetailPath(row)}
            onClick={onClose}
            className={cn(
              'inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)]',
            )}
          >
            View full protocol
          </Link>
        </div>
      </div>
    </GlassModal>
  )
}
