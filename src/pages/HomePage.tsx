import { motion } from 'framer-motion'
import { Check, Headphones, Loader2, Radio, Shield, Sparkles, Waves } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ClassCard } from '../components/class/ClassCard'
import { EngineeredInfrastructureGrid } from '../components/landing/EngineeredInfrastructureGrid'
import { FrequencySpectrumBar } from '../components/landing/FrequencySpectrumBar'
import { TrustProofReviews } from '../components/landing/TrustProofReviews'
import { GlassCta } from '../components/ui/GlassCta'
import { NeonPrimaryLink } from '../components/ui/NeonGlow'
import { CLASS_PUBLIC_SELECT } from '../lib/classSelect'
import { isGuidedMeditation } from '../lib/classKind'
import type { ClassDetails } from '../lib/classTypes'
import { fetchBookedCountsByClassIds } from '../lib/bookingCounts'
import { supabase } from '../lib/supabase'
import {
  calmaHeading,
  calmaMuted,
  zenFloat,
  zenSanctuarySection,
  zenSection,
  zenSectionAccent,
} from '../lib/designSystem'
import { cn } from '../lib/utils'

type HomeLocationState = { adminClassSaved?: boolean; savedTitle?: string }

const ARCHITECTURE_STEPS = [
  {
    step: '01',
    icon: Shield,
    title: 'Secure Curation',
    body: 'Create your private profile in seconds. Every live grid and spatial acoustic protocol is mapped through secure Stripe architecture.',
  },
  {
    step: '02',
    icon: Sparkles,
    title: 'Custom Intention',
    body: 'Select your live transmission or on-demand multi-frequency protocol. Access unlocks instantly inside your personal sanctuary workspace.',
  },
  {
    step: '03',
    icon: Waves,
    title: 'Immersive Transition',
    body: 'Enter the live room or activate spatial HLS playback. Studio-grade nervous-system regulation meets absolute privacy.',
  },
  {
    step: '04',
    icon: Radio,
    title: 'Somatic Kinetic Calibration',
    body: 'Broadcasted via broadcast-grade Mux architecture, our live somatic and physical conditioning sessions lock movement to specific neural frequencies, allowing deep physiological integration and peak performance.',
  },
]

export function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [featuredLive, setFeaturedLive] = useState<ClassDetails[]>([])
  const [featuredAudio, setFeaturedAudio] = useState<ClassDetails[]>([])
  const [bookedByClass, setBookedByClass] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveToast, setSaveToast] = useState<string | null>(null)

  useEffect(() => {
    const st = location.state as HomeLocationState | null
    if (st?.adminClassSaved) {
      setSaveToast(
        st.savedTitle
          ? `“${st.savedTitle}” is now live in the studio grid.`
          : 'Session published successfully.',
      )
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    if (!saveToast) return
    const t = window.setTimeout(() => setSaveToast(null), 7000)
    return () => window.clearTimeout(t)
  }, [saveToast])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const { data, error: qErr } = await supabase
        .from('classes')
        .select(CLASS_PUBLIC_SELECT)
        .eq('is_featured', true)
        .order('scheduled_at', { ascending: true })

      if (cancelled) return

      if (qErr) {
        setError(qErr.message)
        setFeaturedLive([])
        setFeaturedAudio([])
        setLoading(false)
        return
      }

      setError(null)
      const rows = (data ?? []) as ClassDetails[]
      const live = rows.filter((r) => !isGuidedMeditation(r))
      const audio = rows.filter((r) => isGuidedMeditation(r))
      setFeaturedLive(live)
      setFeaturedAudio(audio)

      const liveIds = live.map((r) => r.id)
      if (liveIds.length > 0) {
        const counts = await fetchBookedCountsByClassIds(liveIds)
        if (!cancelled) setBookedByClass(counts)
      } else if (!cancelled) {
        setBookedByClass({})
      }

      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="w-full min-w-0 space-y-20 sm:space-y-24 md:space-y-32">
      {saveToast && (
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-3 px-4 py-3',
            zenFloat,
            'ring-1 ring-[var(--accent)]/25',
          )}
          style={{
            background:
              'linear-gradient(105deg, rgba(45,212,191,0.14) 0%, rgba(250,204,21,0.08) 42%, rgba(255,255,255,0.92) 100%)',
          }}
        >
          <p className="flex items-center gap-2 text-sm font-medium tracking-wide text-[var(--text)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/25 text-[var(--accent)]">
              <Check className="h-4 w-4" />
            </span>
            {saveToast}
          </p>
          <button
            type="button"
            onClick={() => setSaveToast(null)}
            className="text-xs tracking-wide text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero */}
      <section className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="space-y-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--accent)]"
          >
            The science of vibrations
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className={cn(
              'text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl md:text-[2.65rem]',
              calmaHeading,
            )}
          >
            Spatial Audio Protocols.{' '}
            <span className="bg-gradient-to-r from-[var(--accent)] to-[#5eead4] bg-clip-text text-transparent">
              Somatic Live Streams.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cn('max-w-xl text-base leading-[1.75] tracking-wide md:text-lg', calmaMuted)}
          >
            Multi-Frequency Neural Regulation. Experience the synthesis of clinical-grade spatial
            audio protocols and high-fidelity, low-latency somatic live transmissions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap items-center gap-4"
          >
            <NeonPrimaryLink to="/sanctuary" className="tracking-[0.08em]">
              [ Explore Protocols ]
            </NeonPrimaryLink>
            <Link
              to="/sessions"
              className={cn(
                'inline-flex items-center rounded-full px-6 py-3',
                zenFloat,
                'text-sm font-medium tracking-[0.08em] text-slate-800 ring-1 ring-[var(--accent)]/25',
                'transition hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] dark:text-neutral-200',
              )}
            >
              [ Book Live Transmission ]
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className={cn('relative overflow-hidden rounded-3xl p-8 md:p-10', zenFloat)}
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.22),transparent_70%)] blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.12),transparent_70%)] blur-2xl" />
          <p className="relative text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]/90">
            Dual architecture · audio &amp; live somatic
          </p>
          <FrequencySpectrumBar className="relative mt-5" />
          <ul className="relative mt-8 space-y-4 text-sm tracking-wide text-slate-600 dark:text-white/45">
            <li className="flex items-start gap-3">
              <Radio className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
              Live movement grids with intimate cohort sizing
            </li>
            <li className="flex items-start gap-3">
              <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
              Multi-band entrainment from foundation 174Hz to unity 963Hz
            </li>
            <li className="flex items-start gap-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
              Secure HLS + Stripe — clinical-grade delivery, private workspace
            </li>
          </ul>
        </motion.div>
      </section>

      {/* Quantum Acoustic Protocols — directly beneath hero */}
      <section id="audio-sanctuary" className="scroll-mt-28">
        <div className={zenSanctuarySection}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(45,212,191,0.08),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(45,212,191,0.12),transparent_60%)]" />
          <div className="relative space-y-8">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
                Audio Sanctuary
              </p>
              <h2 className={cn('mt-3 text-2xl font-semibold tracking-tight md:text-3xl', calmaHeading)}>
                Quantum Acoustic Protocols
              </h2>
              <p className={cn('mt-4 text-sm leading-relaxed tracking-wide md:text-base', calmaMuted)}>
                Spatial acoustic protocols engineered across the full vibration spectrum — 174Hz
                grounding through 528Hz repair bands to 963Hz unity states. Dolby Atmos mastering,
                secure HLS streaming, and theta-grade entrainment designed for measurable HRV shifts —
                not background ambience.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-14 text-[var(--text-muted)]">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
              </div>
            ) : featuredAudio.length === 0 ? (
              <p className={cn('rounded-2xl px-4 py-10 text-center text-sm tracking-wide', zenFloat, calmaMuted)}>
                Featured acoustic protocols will appear here once curated in admin.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredAudio.map((c, i) => (
                  <ClassCard key={c.id} cls={c} index={i} bookedCount={0} />
                ))}
              </div>
            )}

            <GlassCta
              to="/sanctuary"
              label="Enter the Audio Sanctuary"
              className="bg-white/80 text-slate-900 ring-1 ring-[#2DD4BF]/30 hover:bg-[#2DD4BF]/10 hover:text-[#0d9488] dark:bg-neutral-900/60 dark:text-neutral-100 dark:hover:bg-[#2DD4BF]/15 dark:hover:text-[#2DD4BF]"
            />
          </div>
        </div>
      </section>

      {/* Upcoming Live Transmissions — below protocols */}
      <section id="live-sessions" className="scroll-mt-28">
        <div className={zenSection}>
          <div className={zenSectionAccent} />
          <div className="relative space-y-8">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
                Studio Sessions
              </p>
              <h2 className={cn('mt-3 text-2xl font-semibold tracking-tight md:text-3xl', calmaHeading)}>
                Upcoming Live Transmissions
              </h2>
              <p className={cn('mt-4 text-sm leading-relaxed tracking-wide md:text-base', calmaMuted)}>
                Certified elite instructors lead MOSSA-grade somatic movement programming — high-energy
                and restorative conditioning engineered for peak performance and nervous-system
                integration. Powered by ultra-low latency Mux broadcast infrastructure, every live
                transmission pairs kinetic calibration with synchronized frequency work, delivered in
                broadcast fidelity to your mat.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-14 text-[var(--text-muted)]">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
              </div>
            ) : error ? (
              <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            ) : featuredLive.length === 0 ? (
              <p className={cn('rounded-2xl px-4 py-10 text-center text-sm tracking-wide', zenFloat, calmaMuted)}>
                Featured live transmissions will appear here once curated in admin.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredLive.map((c, i) => (
                  <ClassCard
                    key={c.id}
                    cls={c}
                    index={i}
                    bookedCount={bookedByClass[c.id] ?? 0}
                  />
                ))}
              </div>
            )}

            <GlassCta to="/sessions" label="Explore All Live Sessions" />
          </div>
        </div>
      </section>

      {/* Architecture of Ease */}
      <section id="architecture" className="scroll-mt-28 space-y-12">
        <div className="max-w-3xl">
          <h2 className={cn('text-2xl font-semibold tracking-tight md:text-3xl', calmaHeading)}>
            The Architecture of Ease
          </h2>
          <p className={cn('mt-4 text-base leading-relaxed tracking-wide', calmaMuted)}>
            The science of vibrations and somatic broadcast, delivered without friction. Four
            seamless layers from checkout to spatial playback and Mux live integration:
          </p>
        </div>
        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {ARCHITECTURE_STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={cn('relative p-7 pt-9', zenFloat)}
            >
              <span className="absolute right-5 top-5 font-mono text-xs font-bold tracking-widest text-[var(--accent)]/45">
                {s.step}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] ring-1 ring-[var(--accent)]/20">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className={cn('mt-6 text-sm font-semibold tracking-[0.12em]', calmaHeading)}>
                {s.step} / {s.title}
              </h3>
              <p className={cn('mt-3 text-sm leading-relaxed tracking-wide', calmaMuted)}>
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <EngineeredInfrastructureGrid />

      <TrustProofReviews />
    </div>
  )
}
