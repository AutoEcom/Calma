import { motion } from 'framer-motion'
import { Headphones, Play, Sparkles, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'
import { parseAudioCredits, formatCreditsLine } from '../../lib/audioSanctuary'
import { normalizeWhatToExpect } from '../../lib/whatToExpect'
import { sanctuaryDetailPath } from '../../lib/classKind'
import type { ClassDetails } from '../../lib/classTypes'
import { LocalizedPrice } from '../pricing/LocalizedPrice'
import { NeonCardGlow } from '../ui/NeonGlow'
import {
  badgeOnImageAccent,
  badgeOnImagePill,
  badgeOnImagePrice,
  badgeOnImageWarm,
} from '../../lib/solidBadge'
import { cn } from '../../lib/utils'
import { PlayCountStat } from '../audio/PlayCountStat'

type Props = {
  cls: ClassDetails
  index?: number
}

export function MeditationCard({ cls, index = 0 }: Props) {
  const href = sanctuaryDetailPath(cls)
  const credits = parseAudioCredits(cls.audio_credits)
  const bullets = normalizeWhatToExpect(cls.what_to_expect as unknown)
  const frequency = credits.frequency ?? bullets[0] ?? null
  const metaLine = formatCreditsLine(credits) || frequency

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative pb-1"
    >
      <NeonCardGlow className="h-full">
        <Link
          to={href}
          className={cn(
            'relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] dark:bg-black',
            'transition-colors hover:border-[var(--accent)]/45',
          )}
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-black">
            {cls.image_url || cls.audio_cover_art_url ? (
              <img
                src={cls.image_url ?? cls.audio_cover_art_url ?? ''}
                alt=""
                className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-90"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs tracking-[0.3em] text-white/30">
                CALMA
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <span className={badgeOnImagePill}>
                <Headphones className="h-3 w-3 text-[var(--accent)]" />
                Audio
              </span>
              {cls.badge && (
                <span className={badgeOnImageWarm}>{cls.badge}</span>
              )}
            </div>

            <span className={cn('absolute right-3 top-3', badgeOnImageAccent)}>
              <Waves className="h-3 w-3" />
              Dolby Atmos
            </span>

            <div className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-white text-[var(--accent)] shadow-md transition group-hover:bg-[var(--accent)] group-hover:text-slate-950 dark:bg-slate-900 dark:text-[var(--accent)] dark:group-hover:text-white">
              <Play className="h-5 w-5 fill-current" />
            </div>

            <span className={cn('absolute bottom-3 left-3', badgeOnImagePrice)}>
              <LocalizedPrice cents={cls.price_in_cents} />
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-2 border-t border-[var(--border)] p-4 dark:border-white/5">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-[var(--text)] group-hover:text-[var(--accent)] dark:text-white">
              {cls.title}
            </h3>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[var(--text-muted)] dark:text-white/55">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
              <span>
                {cls.duration_minutes} min · on demand
              </span>
              <span className="text-neutral-400 dark:text-neutral-500">·</span>
              <PlayCountStat count={cls.play_count} />
            </p>
            {metaLine && (
              <p className="text-xs leading-relaxed text-[var(--accent)]/90">{metaLine}</p>
            )}
            {cls.sanctuary_status === 'coming_soon' && (
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Coming soon
              </p>
            )}
          </div>
        </Link>
      </NeonCardGlow>
    </motion.article>
  )
}
