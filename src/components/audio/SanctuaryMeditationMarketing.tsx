import { motion } from 'framer-motion'
import { Headphones, Info, Play, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { parseAudioCredits } from '../../lib/audioSanctuary'
import { sanctuaryCoverUrl } from '../../lib/sanctuaryCover'
import type { ClassDetails } from '../../lib/classTypes'
import { GuestPlayGateModal } from './GuestPlayGateModal'
import { SanctuaryDetailModal } from './SanctuaryDetailModal'
import {
  AtmosphereStudioCredit,
  SanctuaryGuidePriceLine,
  SanctuaryMetaBadges,
} from './SanctuaryProtocolMeta'
import { cn } from '../../lib/utils'

type Props = {
  meditation: ClassDetails
}

function coverArtUrl(row: ClassDetails): string {
  return (
    row.audio_cover_art_url ??
    row.image_url ??
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80'
  )
}

export function SanctuaryMeditationMarketing({ meditation }: Props) {
  const [guestModalOpen, setGuestModalOpen] = useState(false)
  const [learnOpen, setLearnOpen] = useState(false)

  const credits = parseAudioCredits(meditation.audio_credits)
  const guide = credits.guide ?? meditation.instructor_name
  const cover = sanctuaryCoverUrl(meditation) ?? coverArtUrl(meditation)
  const slug = meditation.slug ?? meditation.id
  const returnPath = `/sanctuary/${slug}`
  const comingSoon = meditation.sanctuary_status === 'coming_soon'

  function openGuestGate() {
    if (comingSoon) return
    setGuestModalOpen(true)
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
              {comingSoon ? (
                <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                  Coming soon
                </span>
              ) : (
                meditation.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-slate-900/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2dd4bf] ring-1 ring-[#2dd4bf]/40">
                    {meditation.badge}
                  </span>
                )
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
                <SanctuaryGuidePriceLine
                  className="mt-2"
                  guide={guide}
                  priceInCents={meditation.price_in_cents}
                  showPrice={!comingSoon}
                />
              </div>

              <SanctuaryMetaBadges
                dark
                durationMinutes={meditation.duration_minutes}
                playCount={meditation.play_count}
                frequency={credits.frequency}
              />

              {meditation.description && (
                <p className="text-sm leading-relaxed text-white/70">{meditation.description}</p>
              )}

              {comingSoon ? (
                <>
                  <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                    Coming soon — explore the full overview below.
                  </p>
                  <button
                    type="button"
                    onClick={() => setLearnOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-[#2DD4BF]/40 bg-[#2DD4BF]/10 py-3 text-sm font-semibold text-[#2DD4BF]"
                  >
                    <Info className="h-4 w-4" />
                    Learn more
                  </button>
                </>
              ) : (
                <>
                  <AtmosphereStudioCredit rawCredits={meditation.audio_credits} className="pt-1" />

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setLearnOpen(true)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 py-3 text-sm font-medium text-white backdrop-blur-md"
                    >
                      <Info className="h-4 w-4" />
                      Learn more
                    </button>
                    <button
                      type="button"
                      onClick={openGuestGate}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#2DD4BF]/40 bg-[#2DD4BF]/10 py-3 text-sm font-semibold text-[#2DD4BF]"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Enter Sanctuary
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={openGuestGate}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold',
                      'bg-[#2DD4BF] text-slate-950 shadow-[0_0_32px_rgba(45,212,191,0.35)] hover:brightness-110',
                    )}
                  >
                    <Play className="h-5 w-5 fill-current" />
                    Play audio
                  </button>

                  <p className="flex items-center gap-2 text-xs text-white/45">
                    <Headphones className="h-3.5 w-3.5" />
                    <Sparkles className="h-3.5 w-3.5 text-[#2dd4bf]" />
                    Sign in or create an account to unlock playback
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <SanctuaryDetailModal
        row={learnOpen ? meditation : null}
        onClose={() => setLearnOpen(false)}
      />

      <GuestPlayGateModal
        open={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        meditation={meditation}
        returnPath={returnPath}
      />
    </>
  )
}
