import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, Clock, User } from 'lucide-react'
import { ClassBadgesRow } from './ClassBadges'
import { MeditationCard } from './MeditationCard'
import { NeonCardGlow } from '../ui/NeonGlow'
import { cn } from '../../lib/utils'
import type { ClassDetails } from '../../lib/classTypes'
import { formatEurFromCents } from '../../lib/formatPrice'
import { spotsRemaining } from '../../lib/bookingCounts'
import { classDetailPath, isGuidedMeditation } from '../../lib/classKind'
import { zenFloat } from '../../lib/designSystem'
import { badgeOnImagePrice, badgeOnImageWarm } from '../../lib/solidBadge'

type Props = {
  cls: ClassDetails
  index?: number
  bookedCount?: number
}

function maxCap(cls: ClassDetails): number {
  const m = cls.max_capacity
  return typeof m === 'number' && m > 0 ? m : 20
}

export function ClassCard({ cls, index = 0, bookedCount }: Props) {
  if (isGuidedMeditation(cls)) {
    return <MeditationCard cls={cls} index={index} />
  }

  const href = classDetailPath(cls)
  const when = new Date(cls.scheduled_at)
  const cap = maxCap(cls)
  const booked = bookedCount ?? 0
  const spots = spotsRemaining(cap, booked)
  const full = typeof bookedCount === 'number' && spots <= 0

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
            'flex h-full flex-col overflow-hidden rounded-2xl transition-shadow hover:shadow-[0_20px_48px_-16px_rgba(45,212,191,0.2)]',
            zenFloat,
          )}
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#020617]">
            {cls.image_url ? (
              <img
                src={cls.image_url}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-[var(--text-muted)]">
                CALMA
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute left-3 right-3 top-3 z-10 flex flex-wrap items-start justify-between gap-2">
              <ClassBadgesRow
                sessionType={cls.session_type}
                sessionLevel={cls.session_level}
                onImage
              />
              {full && (
                <span className={badgeOnImageWarm}>Fully booked</span>
              )}
            </div>
            <span className={cn('absolute bottom-3 left-3', badgeOnImagePrice)}>
              {formatEurFromCents(cls.price_in_cents)}
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-slate-900 group-hover:text-[var(--accent)] dark:text-neutral-100">
              {cls.title}
            </h3>
            {typeof bookedCount === 'number' && (
              <p
                className={cn(
                  'text-xs font-medium',
                  full ? 'text-amber-200/90' : 'text-[var(--text-muted)]',
                )}
              >
                {full ? 'No spots left' : `${spots} spot${spots === 1 ? '' : 's'} left`}
              </p>
            )}
            <div className="mt-auto space-y-1.5 text-xs text-[var(--text-muted)]">
              <p className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                <span className="truncate">{cls.instructor_name}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-[var(--accent-warm)]" />
                <span>{when.toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                <span>
                  {when.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  · {cls.duration_minutes} min
                </span>
              </p>
            </div>
          </div>
        </Link>
      </NeonCardGlow>
    </motion.article>
  )
}
