import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/utils'

/** Brand teal #2DD4BF */
const T = '45,212,191'
/** Accent gold #FACC15 */
const G = '250,204,21'

/** Primary CTAs: teal pulse — ~50% tighter blur/spread vs previous */
const glowButtonKeyframes = [
  `0 0 8px rgba(${T},0.22), 0 0 16px rgba(${T},0.1), 0 0 24px rgba(${T},0.04)`,
  `0 0 12px rgba(${T},0.32), 0 0 22px rgba(${T},0.14), 0 0 32px rgba(${T},0.07)`,
  `0 0 8px rgba(${T},0.22), 0 0 16px rgba(${T},0.1), 0 0 24px rgba(${T},0.04)`,
]

/** Cards: subtle teal/gold + thin animated rim (inset ring via box-shadow) */
const glowCardKeyframes = [
  `0 0 6px rgba(${T},0.1), 0 0 12px rgba(${G},0.06), 0 0 0 1px rgba(${T},0.28), inset 0 0 0 1px rgba(${T},0.12)`,
  `0 0 10px rgba(${T},0.14), 0 0 18px rgba(${G},0.09), 0 0 0 1px rgba(${G},0.35), inset 0 0 0 1px rgba(${G},0.14)`,
  `0 0 6px rgba(${T},0.1), 0 0 12px rgba(${G},0.06), 0 0 0 1px rgba(${T},0.28), inset 0 0 0 1px rgba(${T},0.12)`,
]

const glowTransition = { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const }

type NeonCardProps = {
  children: ReactNode
  className?: string
}

/** Outer padding separates adjacent card glows on the grid. */
export function NeonCardGlow({ children, className }: NeonCardProps) {
  return (
    <motion.div
      className={cn('rounded-2xl p-2.5', className)}
      animate={{ boxShadow: glowCardKeyframes }}
      transition={glowTransition}
    >
      {children}
    </motion.div>
  )
}

type NeonLinkProps = Omit<ComponentProps<typeof Link>, 'className'> & {
  className?: string
  children: ReactNode
}

export function NeonPrimaryLink({ className, children, ...linkProps }: NeonLinkProps) {
  return (
    <motion.span
      className={cn('inline-flex max-w-full rounded-full', className)}
      animate={{ boxShadow: glowButtonKeyframes }}
      transition={glowTransition}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        {...linkProps}
        className={cn(
          'inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold',
          'bg-[var(--accent)] text-[var(--on-accent)]',
        )}
      >
        {children}
      </Link>
    </motion.span>
  )
}

type NeonButtonProps = Omit<ComponentProps<'button'>, 'className'> & {
  className?: string
  children: ReactNode
}

export function NeonPrimaryButton({
  className,
  children,
  type = 'button',
  disabled,
  ...props
}: NeonButtonProps) {
  return (
    <motion.span
      className={cn('block w-full rounded-full', className)}
      animate={{ boxShadow: glowButtonKeyframes }}
      transition={glowTransition}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <button
        type={type}
        disabled={disabled}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold',
          'bg-[var(--accent)] text-[var(--on-accent)]',
          'transition-opacity enabled:active:opacity-95',
          'disabled:opacity-50 disabled:hover:scale-100',
        )}
        {...props}
      >
        {children}
      </button>
    </motion.span>
  )
}
