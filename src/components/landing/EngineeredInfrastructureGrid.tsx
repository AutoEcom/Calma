import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type Partner = {
  id: string
  label: string
  tagline: string
  icon: ReactNode
}

function DolbyMark() {
  return (
    <svg viewBox="0 0 120 32" className="h-7 w-auto" aria-hidden>
      <text
        x="0"
        y="22"
        fill="currentColor"
        fontSize="18"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.02em"
      >
        DOLBY
      </text>
      <text
        x="62"
        y="22"
        fill="currentColor"
        fontSize="11"
        fontWeight="500"
        fontFamily="system-ui, sans-serif"
        opacity="0.85"
      >
        ATMOS
      </text>
    </svg>
  )
}

function AppleSpatialMark() {
  return (
    <svg viewBox="0 0 140 32" className="h-7 w-auto" aria-hidden>
      <path
        d="M14 6c-1.2 2.4-3.6 4.2-6 4.5-.5 2.8 2.2 5.5 4.4 6.6 1.1.6 2.4 1.2 3.3 1.2.9 0 1.5-.4 2.8-.4 1.3 0 1.7.4 2.9.4 1.2 0 2.1-.6 3.2-1.4 1-.8 1.7-1.8 1.7-1.9-.1 0-3.3-1.3-3.3-5 0-3.1 2.5-4.6 2.6-4.7-1.4-2.1-3.6-2.3-4.3-2.3-1 0-2.3.6-3 .6-.8 0-1.9-.5-3.1-.5-2.4 0-4.6 1.4-5.8 3.5"
        fill="currentColor"
        transform="translate(0, 4) scale(0.9)"
      />
      <text
        x="32"
        y="21"
        fill="currentColor"
        fontSize="10"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.04em"
      >
        SPATIAL AUDIO
      </text>
    </svg>
  )
}

function StripeMark() {
  return (
    <svg viewBox="0 0 100 32" className="h-6 w-auto" aria-hidden>
      <text
        x="0"
        y="22"
        fill="currentColor"
        fontSize="20"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        letterSpacing="-0.02em"
      >
        stripe
      </text>
    </svg>
  )
}

function QuantumFlowMark() {
  return (
    <svg viewBox="0 0 120 40" className="h-8 w-auto" aria-hidden>
      <path
        d="M8 28 Q20 8 32 28 T56 28 T80 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <text x="44" y="24" fill="currentColor" fontSize="10" fontWeight="600" fontFamily="system-ui">
        Quantum Flow
      </text>
    </svg>
  )
}

function EcosystemMark() {
  return (
    <svg viewBox="0 0 130 36" className="h-8 w-auto" aria-hidden>
      <circle cx="18" cy="18" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="18" r="4" fill="currentColor" />
      <text x="36" y="16" fill="currentColor" fontSize="9" fontWeight="700" fontFamily="system-ui, sans-serif">
        MEMBER
      </text>
      <text x="36" y="28" fill="currentColor" fontSize="9" fontWeight="500" fontFamily="system-ui, sans-serif" opacity="0.8">
        EXPERIENCE
      </text>
    </svg>
  )
}

const PARTNERS: Partner[] = [
  {
    id: 'dolby',
    label: 'Dolby Atmos',
    tagline: '8+1 spatial mastering',
    icon: <DolbyMark />,
  },
  {
    id: 'apple',
    label: 'Apple Spatial Audio',
    tagline: 'Immersive head-tracking ready',
    icon: <AppleSpatialMark />,
  },
  {
    id: 'stripe',
    label: 'Stripe Payments',
    tagline: 'PCI-grade checkout',
    icon: <StripeMark />,
  },
  {
    id: 'flow',
    label: 'Quantum Audio Flow',
    tagline: 'Instant global transmission',
    icon: <QuantumFlowMark />,
  },
  {
    id: 'ecosystem',
    label: 'Member Experience',
    tagline: 'Cross-device sanctuary',
    icon: <EcosystemMark />,
  },
]

export function EngineeredInfrastructureGrid() {
  return (
    <section id="infrastructure" className="scroll-mt-28 space-y-8">
      <div className="max-w-3xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
          Engineered on premium infrastructure
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text)] md:text-3xl">
          Backed by the best
        </h2>
        <p className="mt-4 text-sm leading-relaxed tracking-wide text-[var(--text-muted)] md:text-base">
          Studio protocols ride the same stack trusted by broadcast and fintech — spatial audio,
          encrypted delivery, and frictionless unlocks without compromising privacy.
        </p>
      </div>

      <div
        className={cn(
          'grid gap-3 rounded-3xl border border-white/10 bg-white/40 p-4 backdrop-blur-xl',
          'dark:border-white/[0.08] dark:bg-white/[0.04]',
          'sm:grid-cols-2 lg:grid-cols-5 lg:gap-4 lg:p-5',
        )}
      >
        {PARTNERS.map((p) => (
          <div
            key={p.id}
            className={cn(
              'flex min-h-[108px] flex-col items-center justify-center rounded-2xl',
              'border border-neutral-200/40 bg-white/50 px-4 py-6 text-center',
              'dark:border-white/[0.06] dark:bg-black/20',
              'opacity-40 transition-all duration-300 hover:opacity-80',
            )}
          >
            <div className="text-slate-700 grayscale dark:text-neutral-300">{p.icon}</div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-neutral-400">
              {p.label}
            </p>
            <p className="mt-1 text-[10px] text-slate-500 dark:text-neutral-500">{p.tagline}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
