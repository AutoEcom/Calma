import { motion, useScroll, useTransform } from 'framer-motion'
import { Headphones, Radio, Sparkles, Waves } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { FrequencySpectrumBar } from '../components/landing/FrequencySpectrumBar'
import { cn } from '../lib/utils'

const SECTIONS = [
  {
    id: 'quantum',
    icon: Sparkles,
    label: '01 · Quantum & Acoustic Entrainment',
    title: 'Neural Phase Locking & Solfeggio Medicine',
    body: "Engineered in collaboration with the elite sound engineering laboratory 'The Science', our master-grade protocols deploy precise binaural offsets and Solfeggio matrices (174Hz to 963Hz). By utilizing principles of quantum resonance, we gently shift neural oscillations away from stress markers and lock them into target states of DNA cellular harmony, deep sleep acceleration, or heightened cosmic consciousness.",
    accent: 'from-teal-500/20 to-cyan-500/5',
  },
  {
    id: 'spatial',
    icon: Waves,
    label: '02 · Spatial Audio Physics',
    title: 'Immersive Vagal Regulation',
    body: "Moving beyond flat audio limitations, our Dolby Atmos and Spatial soundscapes wrap 360 degrees around the auditory cortex. This spatial architecture bypasses the brain's defense mechanism, signaling absolute biological safety to the vagus nerve and stabilizing Heart Rate Variability (HRV) within minutes.",
    accent: 'from-emerald-500/15 to-teal-500/5',
  },
  {
    id: 'somatic',
    icon: Radio,
    label: '03 · Somatic Kinematics',
    title: 'Mux-Powered Somatic Streaming',
    body: 'True optimization requires anchoring frequency to movement. Our ultra-low latency live transmissions pair high-fidelity acoustic fields with kinetic physical flows led by world-class certified instructors, generating simultaneous cognitive and muscular calibration.',
    accent: 'from-amber-500/10 to-teal-500/5',
  },
] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function NeuralHeroGraphic() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg className="absolute left-1/2 top-1/2 h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-x-1/2 -translate-y-1/2 opacity-40">
        {[0, 1, 2, 3, 4].map((ring) => (
          <motion.circle
            key={ring}
            cx="50%"
            cy="50%"
            r={40 + ring * 36}
            fill="none"
            stroke="url(#neuralGrad)"
            strokeWidth="0.75"
            initial={{ opacity: 0.15, scale: 0.92 }}
            animate={{ opacity: [0.12, 0.45, 0.12], scale: [0.92, 1.04, 0.92] }}
            transition={{ duration: 4 + ring * 0.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const x2 = 50 + Math.cos(angle) * 42
          const y2 = 50 + Math.sin(angle) * 42
          return (
            <motion.line
              key={i}
              x1="50%"
              y1="50%"
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="#2dd4bf"
              strokeWidth="0.5"
              strokeOpacity="0.35"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0.2, 1, 0.2] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.12 }}
            />
          )
        })}
        <defs>
          <radialGradient id="neuralGrad">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.12),transparent_65%)]" />
    </div>
  )
}

export function AboutMethodsPage() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.35])

  return (
    <div className="relative -mx-4 overflow-hidden sm:-mx-6 md:-mx-8">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative flex min-h-[min(88vh,720px)] items-center justify-center border-b border-white/[0.06] bg-neutral-950 px-4 py-24 sm:px-8"
      >
        <NeuralHeroGraphic />
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-semibold uppercase tracking-[0.32em] text-teal-400"
          >
            About our methods
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-4 text-3xl font-semibold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            The Quantum Architecture
            <br />
            <span className="bg-gradient-to-r from-teal-300 to-cyan-200 bg-clip-text text-transparent">
              of Human Frequency
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-neutral-400 md:text-base"
          >
            Vibration science, spatial acoustics, and Mux-powered somatic streaming — unified in one
            premium nervous-system platform engineered with{' '}
            <span className="text-teal-400/90">The Science</span> collective.
          </motion.p>
        </motion.div>
      </section>

      {/* Bento narrative */}
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-20 sm:px-6 md:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {SECTIONS.map((s, i) => (
            <motion.article
              key={s.id}
              custom={i}
              variants={fadeUp}
              className={cn(
                'group relative overflow-hidden rounded-3xl border border-white/[0.08]',
                'bg-gradient-to-br p-8 backdrop-blur-xl',
                s.accent,
                'bg-neutral-950/80',
              )}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-400/25 bg-teal-400/10 text-teal-400">
                <s.icon className="h-5 w-5" />
              </div>
              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-400/80">
                {s.label}
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-white">{s.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-300">{s.body}</p>
            </motion.article>
          ))}
        </motion.div>

        {/* Interactive frequency band */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 rounded-3xl border border-white/[0.08] bg-black/50 p-8 backdrop-blur-xl md:p-10"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-400">
                Vibration science
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">
                Solfeggio spectrum · 174Hz → 963Hz
              </h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
              The Science × CALMA
            </span>
          </div>
          <FrequencySpectrumBar className="mt-8 [&_p]:text-neutral-400 [&_span]:border-teal-400/25 [&_span]:bg-teal-400/10 [&_span]:text-teal-200/90" />
        </motion.div>

        {/* CTA bento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Link
            to="/sanctuary"
            className="group flex flex-col justify-between rounded-3xl border border-teal-400/30 bg-teal-400/10 p-8 transition hover:bg-teal-400/15"
          >
            <Headphones className="h-8 w-8 text-teal-400" />
            <div className="mt-8">
              <p className="text-lg font-semibold text-white">Explore spatial protocols</p>
              <p className="mt-2 text-sm text-neutral-400">On-demand acoustic matrices in the Audio Sanctuary.</p>
            </div>
          </Link>
          <Link
            to="/sessions"
            className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-8 transition hover:border-white/20"
          >
            <Radio className="h-8 w-8 text-teal-400" />
            <div className="mt-8">
              <p className="text-lg font-semibold text-white">Join live transmissions</p>
              <p className="mt-2 text-sm text-neutral-400">Mux-powered somatic sessions with certified instructors.</p>
            </div>
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
