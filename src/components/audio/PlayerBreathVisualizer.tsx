import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/** 8s meditative breath — 4s inhale, 4s exhale; independent of audio amplitude. */
const BREATH_CYCLE = {
  duration: 8,
  repeat: Infinity,
  ease: 'easeInOut' as const,
  times: [0, 0.5, 1] as number[],
}

type Props = {
  size?: number
  className?: string
}

export function PlayerBreathVisualizer({ size = 220, className }: Props) {
  const orbSize = size * 0.72

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <motion.div
        className="pointer-events-none absolute rounded-full backdrop-blur-3xl"
        style={{
          width: size,
          height: size,
          background:
            'radial-gradient(circle at center, rgba(20, 184, 166, 0.33) 0%, rgba(20, 184, 166, 0.15) 52%, transparent 72%)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.85, 1, 0.85],
        }}
        transition={BREATH_CYCLE}
      />

      <motion.div
        className="pointer-events-none absolute rounded-full border border-[#2DD4BF]/15"
        style={{ width: size * 1.12, height: size * 1.12 }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.38, 0.2] }}
        transition={{ ...BREATH_CYCLE, delay: 0.15 }}
      />

      <motion.div
        className={cn(
          'relative z-10 flex items-center justify-center rounded-full',
          'border border-white/10 bg-black/25',
          'shadow-[0_0_48px_rgba(20,184,166,0.22)]',
        )}
        style={{ width: orbSize, height: orbSize }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={BREATH_CYCLE}
      >
        <span
          className={cn(
            'select-none font-serif font-light leading-none tracking-tight',
            'bg-gradient-to-b from-white via-[#e2e8f0] to-[#2DD4BF]',
            'bg-clip-text text-transparent',
            'drop-shadow-[0_0_18px_rgba(45,212,191,0.45)]',
          )}
          style={{ fontSize: orbSize * 0.42 }}
        >
          C
        </span>
      </motion.div>
    </div>
  )
}
