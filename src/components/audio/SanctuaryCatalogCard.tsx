import { motion } from 'framer-motion'
import { Headphones, Lock, Play, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'
import { parseAudioCredits } from '../../lib/audioSanctuary'
import { sanctuaryDetailPath } from '../../lib/classKind'
import { sanctuaryCoverUrl, sanctuaryMeshGradient } from '../../lib/sanctuaryCover'
import type { Tables } from '../../lib/database.types'
import {
  badgeOnImageAccent,
  badgeOnImagePill,
  badgeOnImageWarm,
} from '../../lib/solidBadge'
import { cn } from '../../lib/utils'

type Row = Tables<'classes'>

type Props = {
  row: Row
  index: number
  hasAccess?: boolean
}

export function SanctuaryCatalogCard({ row, index, hasAccess }: Props) {
  const href = sanctuaryDetailPath(row)
  const cover = sanctuaryCoverUrl(row)
  const credits = parseAudioCredits(row.audio_credits)
  const guide = credits.guide ?? row.instructor_name
  const frequency = credits.frequency
  const comingSoon = row.sanctuary_status === 'coming_soon'

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.05 }}
      className="group"
    >
      <Link
        to={href}
        className="relative block aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-900/20 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.2)] ring-1 ring-slate-200/40 transition duration-500 hover:ring-[#2DD4BF]/35 hover:shadow-[0_24px_60px_-20px_rgba(45,212,191,0.15)] dark:bg-black/40 dark:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.85)] dark:ring-white/[0.06] dark:hover:shadow-[0_24px_60px_-20px_rgba(45,212,191,0.2)]"
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
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_90%,rgba(94,234,212,0.08),transparent_50%)]" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className={badgeOnImagePill}>
            <Waves className="h-3 w-3 text-[#2DD4BF]" />
            Dolby Atmos
          </span>
          {frequency && (
            <span className={badgeOnImageAccent}>{frequency}</span>
          )}
        </div>

        {row.badge && (
          <span className={cn('absolute right-3 top-3', badgeOnImageWarm)}>{row.badge}</span>
        )}

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-900/40 bg-slate-950/90 p-4 dark:border-white/10 dark:bg-black/80">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-white group-hover:text-[#2DD4BF]">
            {row.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
            <Headphones className="h-3.5 w-3.5 shrink-0 text-[#2DD4BF]" />
            <span className="truncate">{guide}</span>
            <span className="text-slate-500">·</span>
            <span className="shrink-0 tabular-nums">{row.duration_minutes} min</span>
          </p>
          {comingSoon && (
            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
              Coming soon
            </p>
          )}
        </div>

        <div
          className={cn(
            'absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-md transition',
            hasAccess
              ? 'border-[#2DD4BF] bg-white text-[#0f766e] group-hover:bg-[#2DD4BF] group-hover:text-slate-950 dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] dark:group-hover:bg-[#2DD4BF] dark:group-hover:text-black'
              : 'border-slate-200 bg-white text-slate-700 group-hover:border-[#2DD4BF] dark:border-white/20 dark:bg-slate-900 dark:text-slate-300',
          )}
        >
          {hasAccess ? (
            <Play className="h-5 w-5 fill-current" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
        </div>
      </Link>
    </motion.article>
  )
}
