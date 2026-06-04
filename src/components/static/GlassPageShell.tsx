import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

type Props = {
  eyebrow: string
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function GlassPageShell({ eyebrow, title, subtitle, children, className }: Props) {
  return (
    <article className={cn('mx-auto max-w-3xl pb-16', className)}>
      <div
        className={cn(
          'rounded-3xl border border-white/[0.08] bg-neutral-950/80 p-8 shadow-[0_24px_80px_-40px_rgba(45,212,191,0.25)]',
          'backdrop-blur-xl md:p-12',
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-400">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-sm leading-relaxed text-neutral-400 md:text-base">{subtitle}</p>
        )}
        <div className="mt-10">{children}</div>
      </div>

      <Link
        to="/"
        className="mt-8 inline-flex text-sm font-medium text-neutral-500 transition hover:text-neutral-300"
      >
        ← Back home
      </Link>
    </article>
  )
}
