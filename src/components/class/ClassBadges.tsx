import { cn } from '../../lib/utils'
import {
  badgeOnImageBase,
  badgeOnImageDark,
  badgeOnImageLight,
} from '../../lib/solidBadge'

export const SESSION_TYPE_VALUES = [
  'yoga',
  'pilates',
  'meditation',
  'guided_meditation',
  'hiit',
  'yin_yoga',
] as const

export const GUIDED_MEDITATION_TYPE = 'guided_meditation' as const
export type SessionTypeValue = (typeof SESSION_TYPE_VALUES)[number]

export const SESSION_LEVEL_VALUES = [
  'beginner',
  'intermediate',
  'advanced',
  'all',
] as const
export type SessionLevelValue = (typeof SESSION_LEVEL_VALUES)[number]

const TYPE_STYLES: Record<SessionTypeValue, { label: string; className: string }> = {
  yoga: {
    label: 'Yoga',
    className:
      'border-emerald-600/35 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/80 dark:text-emerald-200',
  },
  pilates: {
    label: 'Pilates',
    className:
      'border-violet-600/35 bg-violet-50 text-violet-900 dark:border-violet-500/40 dark:bg-violet-950/80 dark:text-violet-200',
  },
  meditation: {
    label: 'Meditation',
    className:
      'border-sky-600/35 bg-sky-50 text-sky-900 dark:border-sky-500/40 dark:bg-sky-950/80 dark:text-sky-200',
  },
  guided_meditation: {
    label: 'Guided Meditation',
    className:
      'border-[var(--accent)]/40 bg-teal-50 text-teal-900 dark:border-[var(--accent)]/35 dark:bg-teal-950/80 dark:text-[var(--accent)]',
  },
  hiit: {
    label: 'HIIT',
    className:
      'border-rose-600/35 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-950/80 dark:text-rose-200',
  },
  yin_yoga: {
    label: 'Yin Yoga',
    className:
      'border-amber-600/40 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/80 dark:text-amber-200',
  },
}

const TYPE_ON_IMAGE: Record<SessionTypeValue, string> = {
  yoga: cn(badgeOnImageLight, 'text-emerald-900 dark:text-emerald-200'),
  pilates: cn(badgeOnImageLight, 'text-violet-900 dark:text-violet-200'),
  meditation: cn(badgeOnImageLight, 'text-sky-900 dark:text-sky-200'),
  guided_meditation: cn(badgeOnImageLight, 'text-teal-900 dark:text-[#2dd4bf]'),
  hiit: cn(badgeOnImageLight, 'text-rose-800 dark:text-rose-200'),
  yin_yoga: cn(badgeOnImageLight, 'text-amber-900 dark:text-amber-200'),
}

const LEVEL_STYLES: Record<SessionLevelValue, { label: string; className: string }> = {
  beginner: {
    label: 'Beginner',
    className:
      'border-teal-600/35 bg-teal-50 text-teal-900 dark:border-teal-500/40 dark:bg-teal-950/80 dark:text-teal-200',
  },
  intermediate: {
    label: 'Intermediate',
    className:
      'border-blue-600/35 bg-blue-50 text-blue-900 dark:border-blue-500/40 dark:bg-blue-950/80 dark:text-blue-200',
  },
  advanced: {
    label: 'Advanced',
    className:
      'border-orange-600/35 bg-orange-50 text-orange-900 dark:border-orange-500/40 dark:bg-orange-950/80 dark:text-orange-200',
  },
  all: {
    label: 'All levels',
    className:
      'border-[var(--accent-warm)]/40 bg-amber-50 text-amber-900 dark:border-[var(--accent-warm)]/35 dark:bg-amber-950/80 dark:text-amber-200',
  },
}

function normalizeType(raw: string | null | undefined): SessionTypeValue {
  const v = (raw ?? 'yoga').toLowerCase()
  return SESSION_TYPE_VALUES.includes(v as SessionTypeValue)
    ? (v as SessionTypeValue)
    : 'yoga'
}

function normalizeLevel(raw: string | null | undefined): SessionLevelValue {
  const v = (raw ?? 'all').toLowerCase()
  return SESSION_LEVEL_VALUES.includes(v as SessionLevelValue)
    ? (v as SessionLevelValue)
    : 'all'
}

export function ClassTypeBadge({
  type,
  onImage,
}: {
  type: string | null | undefined
  onImage?: boolean
}) {
  const key = normalizeType(type)
  const cfg = TYPE_STYLES[key]
  return (
    <span
      className={cn(
        onImage ? TYPE_ON_IMAGE[key] : cn(badgeOnImageBase, 'border', cfg.className),
      )}
    >
      {cfg.label}
    </span>
  )
}

export function ClassLevelBadge({
  level,
  onImage,
}: {
  level: string | null | undefined
  onImage?: boolean
}) {
  const key = normalizeLevel(level)
  const cfg = LEVEL_STYLES[key]
  return (
    <span
      className={cn(
        onImage ? badgeOnImageDark : cn(badgeOnImageBase, 'border', cfg.className),
      )}
    >
      {cfg.label}
    </span>
  )
}

export function ClassBadgesRow({
  sessionType,
  sessionLevel,
  className,
  onImage,
}: {
  sessionType: string | null | undefined
  sessionLevel: string | null | undefined
  className?: string
  onImage?: boolean
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <ClassTypeBadge type={sessionType} onImage={onImage} />
      <ClassLevelBadge level={sessionLevel} onImage={onImage} />
    </div>
  )
}

export const SESSION_TYPE_OPTIONS = SESSION_TYPE_VALUES.map((value) => ({
  value,
  label: TYPE_STYLES[value].label,
}))

export const LIVE_SESSION_TYPE_OPTIONS = SESSION_TYPE_OPTIONS.filter(
  (o) => o.value !== GUIDED_MEDITATION_TYPE,
)

export const SESSION_LEVEL_OPTIONS = SESSION_LEVEL_VALUES.map((value) => ({
  value,
  label: LEVEL_STYLES[value].label,
}))
