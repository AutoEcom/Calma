import { GlassPageShell } from '../components/static/GlassPageShell'
import { Link } from 'react-router-dom'

const METHOD_SECTIONS = [
  {
    title: 'Neural Phase Locking (Acoustic Entrainment)',
    body: 'Our protocols deploy precise binaural offsets and Solfeggio matrices (ranging from 174Hz to 963Hz) to gently guide neural oscillations into target states of deep recovery, deep focus, or creative flow.',
  },
  {
    title: 'Spatial Audio Immersive Physics',
    body: 'Utilizing Dolby Atmos spatial rendering, our soundscapes wrap 360 degrees around the auditory cortex, signaling immediate safety to the vagus nerve and stabilizing Heart Rate Variability (HRV).',
  },
  {
    title: 'High-Fidelity Somatic Movement & Mux Live Transmissions',
    body: 'True transformation requires mapping sound to biology. Powered by ultra-low latency Mux streaming infrastructure, Calma delivers premium broadcast-grade live workout and somatic movement sessions led by certified elite instructors. Similar to MOSSA principles, these live transmissions pair high-energy or restorative physical conditioning with synchronized audio frequencies, unlocking peak kinetic performance and simultaneous nervous system integration.',
  },
] as const

export function AboutMethodsPage() {
  return (
    <GlassPageShell
      eyebrow="About our methods"
      title="The Architectural Science of Calma"
      subtitle="Spatial acoustic protocols and Mux-powered live somatic workouts — engineered as one integrated nervous-system platform."
    >
      <div className="space-y-10">
        {METHOD_SECTIONS.map((section, i) => (
          <section
            key={section.title}
            className="border-t border-white/[0.06] pt-8 first:border-t-0 first:pt-0"
          >
            <p className="text-[10px] font-mono font-semibold text-teal-400/80">
              {String(i + 1).padStart(2, '0')}
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-white">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-300 md:text-[15px]">
              {section.body}
            </p>
          </section>
        ))}

        <div className="flex flex-wrap gap-3 pt-4">
          <Link
            to="/sanctuary"
            className="inline-flex rounded-full border border-teal-400/40 bg-teal-400/10 px-5 py-2.5 text-sm font-semibold text-teal-400 transition hover:bg-teal-400/20"
          >
            Explore Audio Sanctuary
          </Link>
          <Link
            to="/sessions"
            className="inline-flex rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:text-white"
          >
            View Live Transmissions
          </Link>
        </div>
      </div>
    </GlassPageShell>
  )
}
