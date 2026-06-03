import { cn } from './utils'

/** Shared base for badges overlaid on photos — never semi-transparent glass. */
export const badgeOnImageBase =
  'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm'

/** Default neutral tag on images (HIIT, Beginner, price, etc.) */
export const badgeOnImageLight = cn(
  badgeOnImageBase,
  'border-slate-200 bg-white text-slate-950',
  'dark:border-slate-700 dark:bg-slate-900 dark:text-white',
)

/** Inverted solid for secondary tags on images */
export const badgeOnImageDark = cn(
  badgeOnImageBase,
  'border-slate-800 bg-slate-900 text-white',
  'dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100',
)

export const badgeOnImageAccent = cn(
  badgeOnImageBase,
  'border-teal-800 bg-slate-900 text-[#2dd4bf]',
  'dark:border-teal-700 dark:bg-teal-950 dark:text-[#5eead4]',
)

export const badgeOnImageWarm = cn(
  badgeOnImageBase,
  'border-amber-700 bg-amber-400 text-slate-950',
  'dark:border-amber-600 dark:bg-amber-500 dark:text-slate-950',
)

export const badgeOnImagePrice = cn(
  badgeOnImageBase,
  'rounded-full border-slate-200 bg-white px-2.5 py-1 text-xs font-medium normal-case tracking-normal text-slate-950',
  'dark:border-slate-700 dark:bg-slate-900 dark:text-white',
)

export const badgeOnImagePill = cn(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm',
  'border-slate-200 bg-white text-slate-950',
  'dark:border-slate-700 dark:bg-slate-900 dark:text-white',
)

/** Theme-aware sanctuary catalog (readable in light and dark). */
export const sanctuaryPageCanvas =
  'text-slate-600 dark:text-neutral-300'

export const sanctuaryHeading = 'text-slate-900 dark:text-neutral-100'

export const sanctuaryMuted = 'text-slate-600 dark:text-neutral-400'

export const sanctuaryCategoryIdle =
  'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-400'

/** Intentionally dark UI regions (player, sales gate, home premium block). */
export const premiumDarkCanvas = 'calma-premium-dark bg-black text-slate-300'

export const premiumDarkHeading = 'text-white'

export const premiumDarkBody = 'text-slate-300'

export const premiumDarkMuted = 'text-slate-400'
