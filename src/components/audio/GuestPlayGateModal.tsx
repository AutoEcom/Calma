import { Headphones, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCurrency } from '../../hooks/useCurrency'
import { GlassModal } from '../ui/GlassModal'
import type { ClassDetails } from '../../lib/classTypes'

type Props = {
  open: boolean
  onClose: () => void
  meditation: ClassDetails
  returnPath: string
}

export function GuestPlayGateModal({ open, onClose, meditation, returnPath }: Props) {
  const { formatFromCents } = useCurrency()
  const price = formatFromCents(meditation.price_in_cents)

  return (
    <GlassModal open={open} onClose={onClose} title="Unlock this protocol">
      <div className="space-y-5">
        <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-neutral-300">
          <Sparkles className="h-4 w-4 shrink-0 text-[var(--accent)]" />
          Premium Audio Sanctuary · secure Stripe checkout
        </p>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-neutral-400">
          Create your free Calma account to unlock studio-grade spatial audio, manage billing,
          and stream this protocol on any device.
        </p>
        <div className="rounded-2xl bg-slate-100/80 px-4 py-3 text-sm dark:bg-white/[0.06]">
          <p className="font-medium text-slate-900 dark:text-neutral-100">{meditation.title}</p>
          <p className="mt-1 text-slate-600 dark:text-neutral-400">
            One-time unlock · {price}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to="/register"
            state={{ from: returnPath }}
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--on-accent)]"
          >
            <Headphones className="h-4 w-4" />
            Create account
          </Link>
          <Link
            to="/login"
            state={{ from: returnPath }}
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-800 dark:border-white/15 dark:text-neutral-200"
          >
            Log in
          </Link>
        </div>
      </div>
    </GlassModal>
  )
}
