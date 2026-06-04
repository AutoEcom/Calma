import { Headphones, Loader2, Package } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { parseAudioCredits } from '../../lib/audioSanctuary'
import { startCheckoutForBundleCatalog } from '../../lib/checkout'
import { formatEurFromCents } from '../../lib/formatPrice'
import { sanctuaryDetailPath } from '../../lib/classKind'
import { SanctuaryMetaBadges } from './SanctuaryProtocolMeta'
import type { SanctuaryBundleCatalogItem } from '../../lib/sanctuaryBundles'
import { GlassModal } from '../ui/GlassModal'
import { useAuth } from '../../providers/AuthProvider'
import { cn } from '../../lib/utils'

type Props = {
  bundle: SanctuaryBundleCatalogItem | null
  onClose: () => void
}

export function SanctuaryBundleModal({ bundle, onClose }: Props) {
  const { user } = useAuth()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  if (!bundle) return null

  async function unlockBundle() {
    if (!user) return
    setCheckoutError(null)
    setCheckoutLoading(true)
    const { url, error } = await startCheckoutForBundleCatalog(bundle!.id)
    setCheckoutLoading(false)
    if (error) setCheckoutError(error)
    else if (url) window.location.href = url
  }

  return (
    <GlassModal open onClose={onClose} title={bundle.title}>
      <div className="space-y-5">
        {bundle.image_url && (
          <div className="overflow-hidden rounded-2xl ring-1 ring-neutral-200/40 dark:ring-white/10">
            <img src={bundle.image_url} alt="" className="aspect-[16/9] w-full object-cover" />
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[var(--accent)]/35 bg-[var(--accent)]/10 px-3 py-1 font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            Bundle · {bundle.protocolCount} Protocol{bundle.protocolCount === 1 ? '' : 's'}
          </span>
          {bundle.badge && (
            <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-slate-800 dark:bg-white/10 dark:text-neutral-300">
              {bundle.badge}
            </span>
          )}
        </div>

        {bundle.description && (
          <p className="text-sm leading-relaxed text-slate-800 dark:text-neutral-300">
            {bundle.description}
          </p>
        )}

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-500">
            Curated tracks
          </p>
          <ul className="mt-3 space-y-3">
            {bundle.classes.map((cls) => {
              const credits = parseAudioCredits(cls.audio_credits)
              const guide = credits.guide ?? cls.instructor_name
              const comingSoon = cls.sanctuary_status === 'coming_soon'
              return (
                <li
                  key={cls.id}
                  className="rounded-xl border border-neutral-200/50 bg-white/40 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 dark:text-neutral-100">{cls.title}</p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-neutral-400">
                        <Headphones className="mr-1 inline h-3.5 w-3.5 text-[var(--accent)]" />
                        {guide}
                      </p>
                      <SanctuaryMetaBadges
                        className="mt-2"
                        durationMinutes={cls.duration_minutes}
                        playCount={cls.play_count}
                        frequency={credits.frequency}
                      />
                    </div>
                    {comingSoon ? (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-[var(--accent)]">
                        Soon
                      </span>
                    ) : (
                      <Link
                        to={sanctuaryDetailPath(cls)}
                        onClick={onClose}
                        className="shrink-0 text-xs font-medium text-[var(--accent)] hover:underline"
                      >
                        Preview
                      </Link>
                    )}
                  </div>
                  {cls.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-neutral-400">
                      {cls.description}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-3 border-t border-neutral-200/60 pt-4 dark:border-white/[0.08]">
          <p className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-neutral-100">
            <Package className="h-5 w-5 text-[var(--accent)]" />
            {formatEurFromCents(bundle.price_in_cents)}
            <span className="text-sm font-normal text-slate-600 dark:text-neutral-500">
              bundle price
            </span>
          </p>
          {user ? (
            <button
              type="button"
              disabled={checkoutLoading}
              onClick={() => void unlockBundle()}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-50',
              )}
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Opening Stripe…
                </>
              ) : (
                'Unlock bundle'
              )}
            </button>
          ) : (
            <Link
              to="/register"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)]"
            >
              Create account to unlock
            </Link>
          )}
          {checkoutError && <p className="text-sm text-red-400">{checkoutError}</p>}
        </div>
      </div>
    </GlassModal>
  )
}
