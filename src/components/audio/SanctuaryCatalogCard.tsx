import { motion } from 'framer-motion'
import { Headphones, Info, Waves } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { parseAudioCredits } from '../../lib/audioSanctuary'
import { sanctuaryDetailPath } from '../../lib/classKind'
import { PlayCountStat } from './PlayCountStat'
import { sanctuaryCoverUrl, sanctuaryMeshGradient } from '../../lib/sanctuaryCover'
import type { Tables } from '../../lib/database.types'
import { badgeOnImageAccent, badgeOnImagePill, badgeOnImageWarm } from '../../lib/solidBadge'
import { cn } from '../../lib/utils'
import { SanctuaryDetailModal } from './SanctuaryDetailModal'

type Row = Tables<'classes'> & { play_count?: number | null }

type Props = {
  row: Row
  index: number
}

const cardShell =
  'flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-neutral-200/50 bg-white/70 shadow-sm backdrop-blur-md dark:border-white/[0.08] dark:bg-neutral-900/50 dark:shadow-[0_16px_48px_-24px_rgba(0,0,0,0.45)]'

export function SanctuaryCatalogCard({ row, index }: Props) {
  const [learnOpen, setLearnOpen] = useState(false)
  const href = sanctuaryDetailPath(row)
  const cover = sanctuaryCoverUrl(row)
  const credits = parseAudioCredits(row.audio_credits)
  const guide = credits.guide ?? row.instructor_name
  const frequency = credits.frequency
  const comingSoon = row.sanctuary_status === 'coming_soon'

  const media = (
    <>
      {cover ? (
        <img
          src={cover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />
    </>
  )

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-24px' }}
        transition={{ duration: 0.4, delay: (index % 6) * 0.04 }}
        className={cn('group', cardShell)}
      >
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-900">
          {comingSoon ? (
            <div className="relative h-full w-full">{media}</div>
          ) : (
            <Link to={href} className="relative block h-full w-full">
              {media}
            </Link>
          )}

          <div className="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5">
            <span className={badgeOnImagePill}>
              <Waves className="h-3 w-3 text-[#2DD4BF]" />
              Dolby
            </span>
            {frequency && <span className={badgeOnImageAccent}>{frequency}</span>}
          </div>

          {comingSoon ? (
            <span className="absolute right-3 top-3 z-10 rounded-full border border-white/30 bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg backdrop-blur-md">
              Coming soon
            </span>
          ) : (
            row.badge && (
              <span className={cn('absolute right-3 top-3 z-10', badgeOnImageWarm)}>{row.badge}</span>
            )
          )}

          {comingSoon && (
            <div className="pointer-events-none absolute inset-0 z-[5] bg-black/30 backdrop-blur-[2px]" />
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-slate-900 dark:text-neutral-100">
            {row.title}
          </h3>
          <p className="mt-2 flex min-h-[1.25rem] flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-700 dark:text-neutral-400">
            <Headphones className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
            <span className="max-w-full truncate">{guide}</span>
            <span className="text-slate-400 dark:text-neutral-600">·</span>
            <span className="shrink-0 tabular-nums">{row.duration_minutes} min</span>
            <span className="text-slate-400 dark:text-neutral-600">·</span>
            <PlayCountStat count={row.play_count} />
          </p>

          <div className="mt-auto flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setLearnOpen(true)}
              className={cn(
                'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition',
                comingSoon
                  ? 'w-full bg-[var(--accent)]/15 text-[var(--accent)] ring-1 ring-[var(--accent)]/30 hover:bg-[var(--accent)]/25'
                  : 'flex-1 bg-slate-100/90 text-slate-800 hover:bg-slate-200/80 dark:bg-white/[0.06] dark:text-neutral-200 dark:hover:bg-white/10',
              )}
            >
              <Info className="h-3.5 w-3.5 shrink-0" />
              Learn more
            </button>
            {!comingSoon && (
              <Link
                to={href}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-[var(--on-accent)] shadow-sm transition hover:brightness-110"
              >
                Open
              </Link>
            )}
          </div>
        </div>
      </motion.article>

      <SanctuaryDetailModal row={learnOpen ? row : null} onClose={() => setLearnOpen(false)} />
    </>
  )
}
