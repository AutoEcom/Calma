import { motion } from 'framer-motion'
import { Headphones, Info, Lock, Play, Waves } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { parseAudioCredits } from '../../lib/audioSanctuary'
import { sanctuaryDetailPath } from '../../lib/classKind'
import { formatPlayCount, resolvePlayCount } from '../../lib/playCount'
import { sanctuaryCoverUrl, sanctuaryMeshGradient } from '../../lib/sanctuaryCover'
import type { Tables } from '../../lib/database.types'
import {
  badgeOnImageAccent,
  badgeOnImagePill,
  badgeOnImageWarm,
} from '../../lib/solidBadge'
import { cn } from '../../lib/utils'
import { SanctuaryDetailModal } from './SanctuaryDetailModal'

type Row = Tables<'classes'> & { play_count?: number | null }

type Props = {
  row: Row
  index: number
  hasAccess?: boolean
}

export function SanctuaryCatalogCard({ row, index, hasAccess }: Props) {
  const [learnOpen, setLearnOpen] = useState(false)
  const href = sanctuaryDetailPath(row)
  const cover = sanctuaryCoverUrl(row)
  const credits = parseAudioCredits(row.audio_credits)
  const guide = credits.guide ?? row.instructor_name
  const frequency = credits.frequency
  const comingSoon = row.sanctuary_status === 'coming_soon'
  const plays = formatPlayCount(resolvePlayCount(row.play_count))

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, delay: (index % 6) * 0.05 }}
        className="group w-full min-w-0"
      >
        <div className="relative w-full max-w-full overflow-hidden rounded-2xl bg-neutral-900/20 shadow-md ring-1 ring-slate-200/40 dark:bg-black/40 dark:ring-white/[0.06]">
          <Link
            to={href}
            className="relative block aspect-[3/4] w-full max-w-full overflow-hidden"
          >
            {cover ? (
              <img
                src={cover}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            ) : (
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br',
                  sanctuaryMeshGradient(index),
                )}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(45,212,191,0.18),transparent_55%)]" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

            {comingSoon && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[2px]">
                <span className="rounded-full border border-white/25 bg-black/55 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white shadow-lg backdrop-blur-md">
                  Coming soon
                </span>
              </div>
            )}

            <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5">
              <span className={badgeOnImagePill}>
                <Waves className="h-3 w-3 text-[#2DD4BF]" />
                Dolby
              </span>
              {frequency && <span className={badgeOnImageAccent}>{frequency}</span>}
            </div>

            {row.badge && !comingSoon && (
              <span className={cn('absolute right-3 top-3', badgeOnImageWarm)}>{row.badge}</span>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 p-4 pr-14 dark:bg-black/80">
              <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white group-hover:text-[#2DD4BF]">
                {row.title}
              </h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-300">
                <Headphones className="h-3.5 w-3.5 shrink-0 text-[#2DD4BF]" />
                <span className="max-w-full truncate">{guide}</span>
                <span className="text-slate-500">·</span>
                <span className="shrink-0 tabular-nums">{row.duration_minutes} min</span>
              </p>
              <p className="mt-1.5 text-[10px] font-medium tracking-wide text-slate-400">
                Plays: {plays}
              </p>
            </div>

            <div
              className={cn(
                'absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-md',
                hasAccess
                  ? 'border-[#2DD4BF] bg-white text-[#0f766e] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF]'
                  : 'border-slate-200 bg-white text-slate-700 dark:border-white/20 dark:bg-slate-900',
              )}
            >
              {hasAccess ? (
                <Play className="h-4 w-4 fill-current" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
            </div>
          </Link>

          <div className="flex gap-2 border-t border-slate-200/50 bg-white/70 p-2 dark:border-white/[0.06] dark:bg-neutral-950/80">
            <button
              type="button"
              onClick={() => setLearnOpen(true)}
              className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-100/90 px-3 py-2 text-xs font-medium text-slate-800 transition hover:bg-slate-200/80 dark:bg-white/[0.06] dark:text-neutral-200 dark:hover:bg-white/10"
            >
              <Info className="h-3.5 w-3.5 shrink-0" />
              Learn more
            </button>
            <Link
              to={href}
              className="inline-flex min-h-[40px] flex-1 items-center justify-center rounded-xl bg-[var(--accent)]/15 px-3 py-2 text-xs font-semibold text-[var(--accent)]"
            >
              Open
            </Link>
          </div>
        </div>
      </motion.article>

      <SanctuaryDetailModal row={learnOpen ? row : null} onClose={() => setLearnOpen(false)} />
    </>
  )
}
