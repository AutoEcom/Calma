import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '../../lib/utils'

type Props = {
  to: string
  label: string
  className?: string
}

export function GlassCta({ to, label, className }: Props) {
  return (
    <Link
      to={to}
      className={cn(
        'group inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/35',
        'bg-[var(--surface)]/40 px-6 py-3 text-sm font-medium text-[var(--text)]',
        'shadow-[0_8px_32px_-12px_rgba(45,212,191,0.35)] backdrop-blur-xl',
        'transition hover:border-[var(--accent)]/60 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]',
        className,
      )}
    >
      {label}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
    </Link>
  )
}
