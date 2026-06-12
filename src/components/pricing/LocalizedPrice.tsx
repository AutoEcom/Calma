import { formatEurFromCents } from '../../lib/formatPrice'
import { useCurrency } from '../../hooks/useCurrency'
import { cn } from '../../lib/utils'

type Props = {
  cents: number
  className?: string
  /** Show EUR while rates load (avoids layout flash). */
  fallbackEur?: boolean
}

export function LocalizedPrice({ cents, className, fallbackEur = true }: Props) {
  const { formatFromCents, loading } = useCurrency()

  const text =
    loading && fallbackEur ? formatEurFromCents(cents) : formatFromCents(cents)

  return <span className={cn(className)}>{text}</span>
}
