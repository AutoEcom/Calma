import { motion } from 'framer-motion'
import { Headphones, Loader2, Sparkles, Waves } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  startCheckoutForSanctuaryBundle,
  startCheckoutForSanctuarySession,
} from '../../lib/checkout'
import { useCurrency } from '../../hooks/useCurrency'
import { parseAudioCredits } from '../../lib/audioSanctuary'
import type { ClassDetails } from '../../lib/classTypes'
import type { SanctuaryBundleOffer } from '../../lib/sanctuaryBundles'
import { badgeOnImageAccent } from '../../lib/solidBadge'
import { cn } from '../../lib/utils'
import { PlayCountStat } from './PlayCountStat'

function coverArtUrl(row: ClassDetails): string {
  return (
    row.audio_cover_art_url ??
    row.image_url ??
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80'
  )
}

type Props = {
  meditation: ClassDetails
  bundleOffer: SanctuaryBundleOffer | null
}

export function SanctuarySalesGate({ meditation, bundleOffer }: Props) {
  const { formatFromCents } = useCurrency()
  const [checkoutLoading, setCheckoutLoading] = useState<'session' | 'bundle' | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const credits = parseAudioCredits(meditation.audio_credits)
  const guide = credits.guide ?? meditation.instructor_name
  const cover = coverArtUrl(meditation)
  const slug = meditation.slug ?? meditation.id
  const target = { classId: meditation.id, slug }
  const sessionPrice = formatFromCents(meditation.price_in_cents)
  const usageTip =
    meditation.usage_tip?.trim() ||
    'Listen for 21 consecutive days during the New Moon cycle for deepest integration.'

  async function unlockSession() {
    setCheckoutError(null)
    setCheckoutLoading('session')
    const { url, error } = await startCheckoutForSanctuarySession(target)
    setCheckoutLoading(null)
    if (error) {
      setCheckoutError(error)
      return
    }
    if (url) window.location.href = url
  }

  async function unlockBundle() {
    if (!bundleOffer) return
    setCheckoutError(null)
    setCheckoutLoading('bundle')
    const { url, error } = await startCheckoutForSanctuaryBundle(bundleOffer.id, target)
    setCheckoutLoading(null)
    if (error) {
      setCheckoutError(error)
      return
    }
    if (url) window.location.href = url
  }

  return (
    <div className="calma-premium-dark fixed inset-0 z-50 overflow-y-auto bg-black">
      <div className="absolute inset-0">
        <img
          src={cover}
          alt=""
          className="h-full w-full scale-110 object-cover opacity-35 blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/85 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.08),transparent_65%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-full max-w-lg flex-col px-5 py-8">
        <Link
          to="/sanctuary"
          className="mb-6 text-xs text-white/45 transition hover:text-white/80"
        >
          ← Audio Sanctuary
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-1 flex-col"
        >
          <div
            className="overflow-hidden rounded-3xl border border-white/10 bg-black/50 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            style={{
              boxShadow:
                '0 0 0 1px rgba(45,212,191,0.12), 0 32px 64px -16px rgba(0,0,0,0.75)',
            }}
          >
            <div className="relative h-36 overflow-hidden">
              <img src={cover} alt="" className="h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              {meditation.badge && (
                <span className={cn('absolute left-4 top-4 rounded-full px-3 py-1', badgeOnImageAccent)}>
                  <Sparkles className="h-3 w-3" />
                  {meditation.badge}
                </span>
              )}
            </div>

            <div className="space-y-5 p-6 pt-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]/80">
                  Premium Audio Sanctuary
                </p>
                <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-white">
                  {meditation.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <PlayCountStat count={meditation.play_count} variant="prominent" />
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
                    {meditation.duration_minutes} min
                  </span>
                </div>
              </div>

              {meditation.description && (
                <p className="text-sm leading-relaxed text-white/65">{meditation.description}</p>
              )}

              <ul className="space-y-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                  <span>
                    <span className="text-white/45">Guide · </span>
                    {guide}
                  </span>
                </li>
                {credits.studio && (
                  <li className="flex items-start gap-2">
                    <Waves className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span>
                      <span className="text-white/45">Studio · </span>
                      {credits.studio}
                    </span>
                  </li>
                )}
                {credits.frequency && (
                  <li className="flex items-start gap-2 pl-6 text-[var(--accent)]/90">
                    {credits.frequency}
                  </li>
                )}
                <li className="text-xs text-white/45">
                  {meditation.duration_minutes} min · Dolby Atmos ready
                </li>
              </ul>

              <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/[0.06] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                  21-Day Quantum Protocol
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{usageTip}</p>
              </div>

              {checkoutError && (
                <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {checkoutError}
                </p>
              )}

              <button
                type="button"
                onClick={() => void unlockSession()}
                disabled={checkoutLoading != null}
                className={cn(
                  'w-full rounded-full py-4 text-sm font-semibold tracking-wide transition',
                  'border border-[var(--accent)] bg-[var(--accent)] text-black',
                  'shadow-[0_0_32px_rgba(45,212,191,0.45),0_0_64px_-12px_rgba(45,212,191,0.35)]',
                  'hover:brightness-110 disabled:opacity-60',
                )}
              >
                {checkoutLoading === 'session' ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening secure checkout…
                  </span>
                ) : (
                  <>Unlock This Sanctuary Session · {sessionPrice}</>
                )}
              </button>

              {bundleOffer && (
                <button
                  type="button"
                  onClick={() => void unlockBundle()}
                  disabled={checkoutLoading != null}
                  className="w-full rounded-full border border-white/15 bg-white/5 py-3 text-xs font-medium text-white/80 transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)] disabled:opacity-60"
                >
                  {checkoutLoading === 'bundle' ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Opening bundle checkout…
                    </span>
                  ) : (
                    <>
                      Unlock package · {bundleOffer.title} ·{' '}
                      {formatFromCents(bundleOffer.price_in_cents)}
                    </>
                  )}
                </button>
              )}

              <p className="text-center text-[10px] text-white/35">
                Secure payment via Stripe · instant access after confirmation
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
