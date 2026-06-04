import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Props = {
  title: string
  lastUpdated: string
  children: ReactNode
}

export function LegalDocumentLayout({ title, lastUpdated, children }: Props) {
  return (
    <article className="mx-auto max-w-3xl pb-16">
      <div
        className={cn(
          'rounded-3xl border border-white/[0.08] bg-black/40 p-8 shadow-[0_24px_80px_-40px_rgba(45,212,191,0.2)]',
          'backdrop-blur-xl md:p-12',
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-sm text-neutral-500">Last updated: {lastUpdated}</p>

        <div className="mt-10 space-y-8 text-neutral-300 leading-relaxed [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-white [&_p]:text-sm [&_p]:md:text-[15px] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-sm [&_a]:text-[var(--accent)] [&_a]:hover:underline">
          {children}
        </div>
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
