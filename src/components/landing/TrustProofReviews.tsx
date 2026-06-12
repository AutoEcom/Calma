import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { calmaHeading, calmaMuted, zenFloat } from '../../lib/designSystem'

type Review = {
  name: string
  location: string
  badge: string
  body: string
  initials: string
}

const REVIEWS: Review[] = [
  {
    name: 'Dr. Aris Thorne',
    location: 'Austin, TX',
    badge: 'Verified Biohacker',
    initials: 'AT',
    body: "As someone studying neural patterns, Calma's multi-frequency delivery completely shifts the game. The shift from 174Hz foundation frequencies to 528Hz protocols shows immediate impact on heart rate variability (HRV) within 7 minutes of listening. Absolutely clinical grade.",
  },
  {
    name: 'Elena R.',
    location: 'Miami, FL',
    badge: 'Active Member',
    initials: 'ER',
    body: 'My clients use the 417Hz subconscious programming tracks before high-stakes presentations. The Dolby Atmos integration makes you feel wrapped in sound. It’s no longer meditation; it’s cognitive software. Calma is a core part of my daily ritual.',
  },
  {
    name: 'Marcus Vance',
    location: 'Los Angeles, CA',
    badge: 'Verified Practitioner',
    initials: 'MV',
    body: 'The multi-frequency architecture solves the flat-audio limitation of older apps. High-fidelity quantum audio flow at 963Hz with actual spatial acoustics induces states of deep regulation that used to require hours of isolation. Phenomenal craft.',
  },
]

export function TrustProofReviews() {
  return (
    <section id="trust" className="scroll-mt-28 space-y-10">
      <div className="max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
          Trust proof
        </p>
        <h2 className={cn('mt-3 text-2xl font-semibold tracking-tight md:text-3xl', calmaHeading)}>
          Voices from the frequency frontier
        </h2>
        <p className={cn('mt-4 text-sm leading-relaxed tracking-wide md:text-base', calmaMuted)}>
          Practitioners and members reporting measurable regulation — not generic wellness fluff.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {REVIEWS.map((r, i) => (
          <motion.article
            key={r.name}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-24px' }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            className={cn('flex h-full flex-col p-6 sm:p-7', zenFloat)}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-semibold text-slate-700 ring-2 ring-white/80 dark:from-neutral-700 dark:to-neutral-800 dark:text-neutral-200 dark:ring-white/10"
                aria-hidden
              >
                {r.initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight text-[var(--text)]">{r.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{r.location}</p>
              </div>
            </div>

            <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-full border border-[#2DD4BF]/35 bg-[#2DD4BF]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0d9488] dark:text-[#2DD4BF]">
              [✓] {r.badge}
            </span>

            <p className="mt-5 flex-1 text-sm leading-[1.75] tracking-wide text-slate-700 dark:text-neutral-300">
              &ldquo;{r.body}&rdquo;
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
