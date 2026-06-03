import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '../../lib/utils'

type Particle = {
  id: number
  x: number
  emoji: string
}

const EMOJIS = ['❤️', '🔥', '✨', '💚', '🙌']

let particleId = 0

export function LiveReactionBurst() {
  const [particles, setParticles] = useState<Particle[]>([])

  const burst = useCallback(() => {
    const count = 6 + Math.floor(Math.random() * 4)
    const batch: Particle[] = Array.from({ length: count }, () => ({
      id: ++particleId,
      x: 20 + Math.random() * 60,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]!,
    }))
    setParticles((p) => [...p, ...batch].slice(-40))
    batch.forEach((b) => {
      window.setTimeout(() => {
        setParticles((p) => p.filter((x) => x.id !== b.id))
      }, 2200)
    })
  }, [])

  return (
    <>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], y: -120 - Math.random() * 80, scale: [0.5, 1.2, 1, 0.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute bottom-16 text-2xl sm:text-3xl"
              style={{ left: `${p.x}%` }}
            >
              {p.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={burst}
        className={cn(
          'absolute bottom-4 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full',
          'border border-[var(--accent)]/50 bg-black/60 text-[var(--accent)] shadow-lg backdrop-blur-md',
          'transition hover:scale-105 hover:bg-[var(--accent)]/20 hover:shadow-[0_0_24px_rgba(45,212,191,0.35)]',
        )}
        aria-label="Send a reaction"
      >
        <Heart className="h-6 w-6 fill-current" />
      </button>
    </>
  )
}
