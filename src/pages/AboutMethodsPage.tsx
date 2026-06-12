import { motion, useScroll, useTransform } from 'framer-motion'
import { Headphones, Radio, Sparkles, Waves } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { FlowerOfLifeBackground } from '../components/about/FlowerOfLifeBackground'
import { FrequencySpectrumBar } from '../components/landing/FrequencySpectrumBar'
import { cn } from '../lib/utils'

const PILLARS = [
  {
    id: 'acoustic',
    icon: Sparkles,
    label: 'Pillar 1 · Acoustic Medicine',
    title: 'Neural Phase Locking & Solfeggio Medicine',
    body: "Engineered in collaboration with the elite sound engineering laboratory 'The Science', our master-grade protocols deploy precise binaural offsets and Solfeggio matrices (174Hz to 963Hz). By utilizing principles of quantum resonance, we gently shift neural oscillations away from stress markers and lock them into target states of DNA cellular harmony, deep sleep acceleration, or heightened cosmic consciousness.",
  },
  {
    id: 'spatial',
    icon: Waves,
    label: 'Pillar 2 · Spatial Audio',
    title: 'Immersive Vagal Regulation',
    body: "Moving beyond flat audio limitations, our Dolby Atmos and Spatial soundscapes wrap 360 degrees around the auditory cortex. This spatial architecture bypasses the brain's baseline defense mechanisms, signaling absolute biological safety to the vagus nerve and stabilizing Heart Rate Variability (HRV) within minutes.",
  },
  {
    id: 'somatic',
    icon: Radio,
    label: 'Pillar 3 · Somatic Integration',
    title: 'High-Fidelity Somatic Transmissions',
    body: 'True transformation requires anchoring frequency directly to physical biology. Our ultra-low latency studio-grade broadcasts pair high-fidelity acoustic fields with kinetic movement sequences led by world-class certified instructors, generating simultaneous cognitive and muscular calibration.',
  },
] as const

const cardGlow =
  'rounded-3xl border border-white/[0.08] bg-neutral-950/75 shadow-[0_0_60px_-20px_rgba(45,212,191,0.35)] backdrop-blur-xl'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function AboutMethodsPage() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3])

  return (
    <div className="relative -mx-4 overflow-hidden bg-neutral-950 sm:-mx-6 md:-mx-8">
      <section
        ref={heroRef}
        className="relative flex min-h-[min(92vh,760px)] items-center justify-center border-b border-white/[0.06] px-4 py-28 sm:px-8"
      >
        <FlowerOfLifeBackground />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.08),transparent_70%)]" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-4xl px-2 text-center"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            animate={{ opacity: 1, letterSpacing: '0.32em' }}
            transition={{ duration: 0.8 }}
            className="text-[10px] font-semibold uppercase text-teal-400"
          >
            About our methods
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="mt-5 text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-[3.25rem]"
          >
            The Quantum Architecture
            <br />
            <span className="bg-gradient-to-r from-teal-200 via-teal-400 to-cyan-300 bg-clip-text text-transparent">
              of Human Frequency
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.65 }}
            className="mx-auto mt-7 max-w-2xl text-sm leading-relaxed text-neutral-400 md:text-base"
          >
            Vibration science, spatial acoustics, and studio-grade somatic transmissions — unified
            with <span className="text-teal-400/90">The Science</span> collective.
          </motion.p>
        </motion.div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:px-8">
        <FlowerOfLifeBackground className="opacity-60" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="relative z-10 grid gap-6 lg:grid-cols-3"
        >
          {PILLARS.map((p, i) => (
            <motion.article
              key={p.id}
              custom={i}
              variants={fadeUp}
              className={cn(cardGlow, 'group p-8 transition duration-500 hover:shadow-[0_0_80px_-16px_rgba(45,212,191,0.45)]')}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-400/30 bg-teal-400/10 text-teal-400 shadow-[0_0_24px_-8px_rgba(45,212,191,0.5)]">
                <p.icon className="h-5 w-5" />
              </div>
              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-400/85">
                {p.label}
              </p>
              <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">{p.title}</h2>
              <p className="mt-4 text-sm leading-[1.75] text-neutral-300">{p.body}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className={cn(cardGlow, 'relative z-10 mt-10 p-8 md:p-12')}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-400">
            Sacred geometry · vibration map
          </p>
          <h2 className="mt-3 text-xl font-semibold text-white md:text-2xl">
            Solfeggio spectrum · 174Hz → 963Hz
          </h2>
          <FrequencySpectrumBar className="mt-8 [&_p]:text-neutral-400 [&_span]:border-teal-400/25 [&_span]:bg-teal-400/10 [&_span]:text-teal-200/90" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 mt-8 grid gap-4 sm:grid-cols-2"
        >
          <Link
            to="/sanctuary"
            className={cn(
              cardGlow,
              'flex flex-col justify-between p-8 transition hover:shadow-[0_0_70px_-18px_rgba(45,212,191,0.5)]',
            )}
          >
            <Headphones className="h-8 w-8 text-teal-400" />
            <div className="mt-10">
              <p className="text-lg font-semibold text-white">Explore spatial protocols</p>
              <p className="mt-2 text-sm text-neutral-400">
                On-demand quantum audio flow in the Audio Sanctuary.
              </p>
            </div>
          </Link>
          <Link
            to="/sessions"
            className={cn(
              cardGlow,
              'flex flex-col justify-between p-8 transition hover:border-white/15 hover:shadow-[0_0_50px_-20px_rgba(45,212,191,0.35)]',
            )}
          >
            <Radio className="h-8 w-8 text-teal-400" />
            <div className="mt-10">
              <p className="text-lg font-semibold text-white">Join live transmissions</p>
              <p className="mt-2 text-sm text-neutral-400">
                Cinematic somatic broadcasts with certified instructors.
              </p>
            </div>
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
