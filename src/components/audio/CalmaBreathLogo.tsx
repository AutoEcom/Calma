import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/** ~5 breaths/min (12s cycle) — meditative pacing for in-session breathing guide */
const breathTransition = {
  duration: 12,
  repeat: Infinity,
  ease: 'easeInOut' as const,
}

type Props = {
  className?: string
  size?: number
}

export function CalmaBreathLogo({ className, size = 120 }: Props) {
  return (
    <motion.div
      className={cn('relative flex items-center justify-center', className)}
      animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
      transition={breathTransition}
      aria-hidden
    >
      <div
        className="absolute rounded-full bg-[#2DD4BF]/20 blur-3xl"
        style={{ width: size * 1.6, height: size * 1.6 }}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative drop-shadow-[0_0_28px_rgba(45,212,191,0.55)]"
      >
        <circle cx="60" cy="60" r="54" stroke="rgba(45,212,191,0.25)" strokeWidth="1" />
        <path
          d="M60 22c-14 0-26 11-26 26 0 10 5 18 14 24l12 8 12-8c9-6 14-14 14-24 0-15-12-26-26-26z"
          fill="url(#calmaGrad)"
        />
        <path
          d="M48 58c4-8 20-8 24 0"
          stroke="#2DD4BF"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.9"
        />
        <defs>
          <linearGradient id="calmaGrad" x1="34" y1="22" x2="86" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2DD4BF" />
            <stop offset="1" stopColor="#14B8A6" stopOpacity="0.7" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  )
}
