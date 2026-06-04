import { Bell, Info, Play, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SanctuaryDetailModal } from './SanctuaryDetailModal'
import { parseAudioCredits } from '../../lib/audioSanctuary'
import { sanctuaryDetailPath } from '../../lib/classKind'
import { sanctuaryCoverUrl, sanctuaryMeshGradient } from '../../lib/sanctuaryCover'
import { supabase } from '../../lib/supabase'
import type { Tables } from '../../lib/database.types'
import { badgeOnImageWarm } from '../../lib/solidBadge'
import { cn } from '../../lib/utils'
import { useAuth } from '../../providers/AuthProvider'
import { PlayCountStat } from './PlayCountStat'

type Row = Tables<'classes'>

type Props = {
  featured: Row
  hasAccess?: boolean
}

export function FeaturedProtocolHero({ featured, hasAccess }: Props) {
  const { user } = useAuth()
  const cover = sanctuaryCoverUrl(featured)
  const credits = parseAudioCredits(featured.audio_credits)
  const guide = credits.guide ?? featured.instructor_name
  const comingSoon = featured.sanctuary_status === 'coming_soon'
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [learnOpen, setLearnOpen] = useState(false)

  const submitWaitlist = async () => {
    if (!notifyEmail.trim()) return
    setNotifyStatus('sending')
    const { error } = await supabase.from('audio_sanctuary_waitlist').insert({
      class_id: featured.id,
      email: notifyEmail.trim().toLowerCase(),
      member_id: user?.id ?? null,
    })
    setNotifyStatus(error ? 'error' : 'sent')
  }

  return (
    <>
    <section className="relative mb-10 w-full min-w-0 overflow-hidden rounded-3xl bg-white/60 shadow-[0_24px_64px_-28px_rgba(15,23,42,0.14)] ring-1 ring-[#2DD4BF]/15 backdrop-blur-sm dark:bg-neutral-900/40 dark:shadow-[0_32px_80px_-32px_rgba(45,212,191,0.25)] dark:ring-[#2DD4BF]/20 sm:mb-12">
      <div className="grid min-h-[280px] grid-cols-1 md:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-[220px] md:min-h-0">
          {cover ? (
            <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br',
                sanctuaryMeshGradient(0),
              )}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black md:bg-gradient-to-r md:from-transparent md:to-black" />
          <span className={cn('absolute left-5 top-5', badgeOnImageWarm)}>
            <Sparkles className="h-3.5 w-3.5" />
            Featured Protocol
          </span>
        </div>

        <div className="relative flex flex-col justify-center bg-white/95 p-6 sm:p-8 dark:bg-black/80 dark:backdrop-blur-sm md:dark:bg-black/60">
          {comingSoon && (
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#2DD4BF]">
              Coming soon
            </p>
          )}
          {featured.badge && !comingSoon && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#2DD4BF]">
              {featured.badge}
            </p>
          )}
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl md:text-3xl dark:text-white">
            {featured.title}
          </h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-slate-600 dark:text-white/50">
            <span>
              {guide} · {featured.duration_minutes} min
              {credits.frequency ? ` · ${credits.frequency}` : ''}
            </span>
            <span className="text-slate-400 dark:text-neutral-500">·</span>
            <PlayCountStat count={featured.play_count} />
          </p>
          {featured.description && (
            <p className="mt-4 line-clamp-4 text-sm leading-relaxed tracking-wide text-slate-600 dark:text-white/65">
              {featured.description}
            </p>
          )}

          <div className="mt-8">
            {comingSoon ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setLearnOpen(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#2DD4BF]/40 bg-[#2DD4BF]/10 px-5 py-2.5 text-sm font-semibold text-[#0f766e] dark:text-[#2DD4BF] sm:w-auto"
                >
                  <Info className="h-4 w-4" />
                  Learn more
                </button>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="Email for launch alert"
                    className="min-w-0 w-full flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2DD4BF]/50 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => void submitWaitlist()}
                    disabled={notifyStatus === 'sending'}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2DD4BF] px-5 py-2.5 text-sm font-semibold text-black"
                  >
                    <Bell className="h-4 w-4" />
                    Notify me
                  </button>
                </div>
              </div>
            ) : !user ? (
              <Link
                to="/login"
                state={{ from: sanctuaryDetailPath(featured) }}
                className="inline-flex items-center gap-2 rounded-full bg-[#2DD4BF] px-6 py-3 text-sm font-semibold text-black"
              >
                Sign in to begin
              </Link>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setLearnOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-800 dark:border-white/15 dark:bg-white/10 dark:text-neutral-200"
                >
                  <Info className="h-4 w-4" />
                  Learn more
                </button>
                <Link
                  to={sanctuaryDetailPath(featured)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2DD4BF] px-6 py-3 text-sm font-semibold text-black shadow-[0_0_40px_rgba(45,212,191,0.35)] hover:brightness-110"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {hasAccess ? 'Enter sanctuary' : 'Unlock protocol'}
                </Link>
              </div>
            )}
            {notifyStatus === 'sent' && (
              <p className="mt-2 text-xs text-[#2DD4BF]">You&apos;re on the waitlist.</p>
            )}
          </div>
        </div>
      </div>
    </section>
      <SanctuaryDetailModal
        row={learnOpen ? featured : null}
        onClose={() => setLearnOpen(false)}
      />
    </>
  )
}
