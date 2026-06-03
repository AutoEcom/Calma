import { motion } from 'framer-motion'
import { Headphones, Play, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  startCheckoutForSanctuaryBundle,
  startCheckoutForSanctuarySession,
} from '../../lib/checkout'
import { formatEurFromCents } from '../../lib/formatPrice'
import { parseAudioCredits } from '../../lib/audioSanctuary'
import { sanctuaryCoverUrl } from '../../lib/sanctuaryCover'
import { formatPlayCount, resolvePlayCount } from '../../lib/playCount'
import type { ClassDetails } from '../../lib/classTypes'
import type { SanctuaryBundleOffer } from '../../lib/sanctuaryBundles'
import { GuestPlayGateModal } from './GuestPlayGateModal'
import { useAuth } from '../../providers/AuthProvider'
import { cn } from '../../lib/utils'

type Props = {
  meditation: ClassDetails
  bundleOffer?: SanctuaryBundleOffer | null
  onPlayWithoutAccess?: () => void
}

function coverArtUrl(row: ClassDetails): string {
  return (
    row.audio_cover_art_url ??
    row.image_url ??
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80'
  )
}

export function SanctuaryMeditationMarketing({
  meditation,
  bundleOffer = null,
  onPlayWithoutAccess,
}: Props) {
  const { user } = useAuth()
  const [guestModalOpen, setGuestModalOpen] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const credits = parseAudioCredits(meditation.audio_credits)
  const guide = credits.guide ?? meditation.instructor_name
  const cover = sanctuaryCoverUrl(meditation) ?? coverArtUrl(meditation)
  const slug = meditation.slug ?? meditation.id
  const returnPath = `/sanctuary/${slug}`
  const plays = formatPlayCount(resolvePlayCount(meditation.play_count, meditation.id))
  const comingSoon = meditation.sanctuary_status === 'coming_soon'
  const price = formatEurFromCents(meditation.price_in_cents)

  async function handlePlay() {
    if (comingSoon) return
    if (!user) {
      setGuestModalOpen(true)
      return
    }
    onPlayWithoutAccess?.()
  }

  async function unlockSession() {
    setCheckoutError(null)
    setCheckoutLoading(true)
    const { url, error } = await startCheckoutForSanctuarySession({
      classId: meditation.id,
      slug,
    })
    setCheckoutLoading(false)
    if (error) setCheckoutError(error)
    else if (url) window.location.href = url
  }

  async function unlockBundle() {
    if (!bundleOffer) return
    setCheckoutError(null)
    setCheckoutLoading(true)
    const { url, error } = await startCheckoutForSanctuaryBundle(bundleOffer.id, {
      classId: meditation.id,
      slug,
    })
    setCheckoutLoading(false)
    if (error) setCheckoutError(error)
    else if (url) window.location.href = url
  }

  return (
    <>
      <div className="calma-premium-dark relative min-h-[calc(100vh-6rem)] overflow-hidden rounded-3xl bg-black">
        <div className="absolute inset-0">
          <img src={cover} alt="" className="h-full w-full scale-110 object-cover opacity-35 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/85 to-black" />
        </div>

        <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-lg flex-col px-4 py-8 sm:px-6">
          <Link
            to="/sanctuary"
            className="text-xs font-medium tracking-[0.14em] text-white/45 transition hover:text-white"
          >
            ← Sanctuary
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-black/50 shadow-2xl backdrop-blur-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={cover} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              {meditation.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-slate-900/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2dd4bf] ring-1 ring-[#2dd4bf]/40">
                  {meditation.badge}
                </span>
              )}
            </div>

            <div className="space-y-4 p-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#2dd4bf]">
                  Audio Sanctuary
                </p>
                <h1 className="mt-2 text-2xl font-semibold leading-tight text-white">
                  {meditation.title}
                </h1>
                <p className="mt-2 text-sm text-white/55">Guided by {guide}</p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 font-medium text-white backdrop-blur-md">
                  Plays: {plays}
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/80 backdrop-blur-md">
                  {meditation.duration_minutes} min
                </span>
                {credits.frequency && (
                  <span className="rounded-full border border-[#2dd4bf]/30 bg-[#2dd4bf]/10 px-3 py-1 text-[#2dd4bf]">
                    {credits.frequency}
                  </span>
                )}
              </div>

              {meditation.description && (
                <p className="text-sm leading-relaxed text-white/70">{meditation.description}</p>
              )}

              {comingSoon ? (
                <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                  Coming soon — join the waitlist from the sanctuary catalog.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => void handlePlay()}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold',
                    'bg-[#2DD4BF] text-slate-950 shadow-[0_0_32px_rgba(45,212,191,0.35)] hover:brightness-110',
                  )}
                >
                  <Play className="h-5 w-5 fill-current" />
                  Play audio
                </button>
              )}

              {user && !comingSoon && (
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    disabled={checkoutLoading}
                    onClick={() => void unlockSession()}
                    className="w-full rounded-full border border-[#2DD4BF]/50 bg-[#2DD4BF]/15 py-3 text-sm font-semibold text-[#2DD4BF] disabled:opacity-50"
                  >
                    {checkoutLoading ? 'Opening Stripe…' : `Unlock · ${price}`}
                  </button>
                  {bundleOffer && (
                    <button
                      type="button"
                      disabled={checkoutLoading}
                      onClick={() => void unlockBundle()}
                      className="w-full rounded-full border border-white/15 py-2.5 text-xs text-white/70 hover:border-[#2DD4BF]/40"
                    >
                      Bundle offer available
                    </button>
                  )}
                </div>
              )}

              {!user && !comingSoon && (
                <p className="flex items-center gap-2 text-xs text-white/45">
                  <Headphones className="h-3.5 w-3.5" />
                  <Sparkles className="h-3.5 w-3.5 text-[#2dd4bf]" />
                  Sign in or create an account to unlock playback
                </p>
              )}

              {checkoutError && (
                <p className="text-sm text-red-300">{checkoutError}</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <GuestPlayGateModal
        open={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        meditation={meditation}
        returnPath={returnPath}
      />
    </>
  )
}
