import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

type Props = {
  className?: string
  asLink?: boolean
}

export function CalmaLogo({ className, asLink = true }: Props) {
  const inner = (
    <span
      className={cn(
        'bg-gradient-to-r from-[var(--accent)] to-[#5eead4] bg-clip-text text-lg font-semibold tracking-[0.2em] text-transparent',
        className,
      )}
    >
      CALMA
    </span>
  )

  if (!asLink) return inner
  return (
    <Link to="/" className="inline-flex items-center" aria-label="Calma home">
      {inner}
    </Link>
  )
}
