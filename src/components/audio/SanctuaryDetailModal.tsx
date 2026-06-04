import { Clock, Headphones, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  CATEGORY_LABELS,
  parseAudioCredits,
  type AudioSanctuaryCategory,
} from '../../lib/audioSanctuary'
import { sanctuaryDetailPath } from '../../lib/classKind'
import { PlayCountStat } from './PlayCountStat'
import { formatEurFromCents } from '../../lib/formatPrice'
import { sanctuaryCoverUrl } from '../../lib/sanctuaryCover'
import { normalizeWhatToExpect } from '../../lib/whatToExpect'
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
  const bullets = normalizeWhatToExpect(row.what_to_expect as unknown)

  return (
    <GlassModal open onClose={onClose} title={row.title}>
      <div className="space-y-5">
        {cover && (
          <div className="overflow-hidden rounded-2xl ring-1 ring-neutral-200/40 dark:ring-white/10">
            <img src={cover} alt="" className="aspect-[16/9] w-full object-cover" />
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          {comingSoon && (
            <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1 font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              Coming soon
            </span>
          )}
          <PlayCountStat
            count={row.play_count}
            variant="muted"
            className="rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-[var(--accent)]"
          />
          <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-slate-800 dark:bg-white/10 dark:text-neutral-300">
            {row.duration_minutes} min
          </span>
          {category && (
            <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-slate-800 dark:bg-white/10 dark:text-neutral-300">
              {category}
            </span>
          )}
        </div>

        <p className="text-sm text-slate-800 dark:text-neutral-300">
          <Headphones className="mr-1.5 inline h-4 w-4 text-[var(--accent)]" />
          Guided by {guide}
          {credits.frequency ? (
            <>
              <span className="text-slate-400 dark:text-neutral-600"> · </span>
              <span className="font-medium text-[var(--accent)]">{credits.frequency}</span>
            </>
          ) : null}
        </p>

        {row.description && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-500">
              Overview
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-neutral-300">
              {row.description}
            </p>
          </div>
        )}

        {bullets.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-500">
              What to expect
            </p>
            <ul className="mt-2 space-y-2">
              {bullets.map((line) => (
                <li
                  key={line}
                  className="flex gap-2 text-sm leading-relaxed text-slate-800 dark:text-neutral-300"
                >
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        {row.usage_tip && (
          <p className="rounded-xl border border-neutral-200/50 bg-white/40 px-4 py-3 text-sm text-slate-700 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-400">
            <Sparkles className="mr-1.5 inline h-4 w-4 text-[var(--accent)]" />
            {row.usage_tip}
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-neutral-200/60 pt-4 dark:border-white/[0.08]">
          <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
            {formatEurFromCents(row.price_in_cents)}
            <span className="ml-2 font-normal text-slate-600 dark:text-neutral-500">
              <Clock className="mr-0.5 inline h-3.5 w-3.5" />
              Dolby Atmos · secure HLS
            </span>
          </p>
          {comingSoon ? (
            <p className="text-sm leading-relaxed text-slate-700 dark:text-neutral-400">
              This protocol is not open for playback yet. Explore the details above and check back
              when the launch badge clears from the catalog.
            </p>
          ) : (
            <Link
              to={sanctuaryDetailPath(row)}
              onClick={onClose}
              className={cn(
                'inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)]',
              )}
            >
              View full protocol
            </Link>
          )}
        </div>
      </div>
    </GlassModal>
  )
}
