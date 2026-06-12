import { motion } from 'framer-motion'
import { CalmaBreathLogo } from './CalmaBreathLogo'
import { cn } from '../../lib/utils'

const BAR_COUNT = 24

type Props = {
  playing: boolean
  size?: number
  className?: string
}

export function PlayerBreathVisualizer({ playing, size = 200, className }: Props) {
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Outer breathing rings */}
      {[1.55, 1.25, 1.05].map((scale, i) => (
        <motion.div
          key={scale}
          className="pointer-events-none absolute rounded-full border border-[#2DD4BF]/20"
          style={{ width: size * scale, height: size * scale }}
          animate={
            playing
              ? {
                  scale: [1, 1.06, 1],
                  opacity: [0.15 + i * 0.05, 0.35 - i * 0.05, 0.15 + i * 0.05],
                }
              : { scale: 1, opacity: 0.12 + i * 0.04 }
          }
          transition={{
            duration: playing ? 4 + i * 0.8 : 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        />
      ))}

      {/* Waveform ring */}
      <div
        className="absolute flex items-center justify-center gap-[3px]"
        style={{ width: size * 1.35, height: size * 0.5 }}
        aria-hidden
      >
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-gradient-to-t from-[#2DD4BF]/30 to-[#2DD4BF]"
            animate={
              playing
                ? {
                    height: [
                      8 + (i % 5) * 3,
                      18 + ((i * 7) % 11) * 2,
                      10 + (i % 4) * 2,
                    ],
                    opacity: [0.4, 0.95, 0.5],
                  }
                : { height: 6 + (i % 3) * 2, opacity: 0.25 }
            }
            transition={{
              duration: playing ? 0.55 + (i % 7) * 0.08 : 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.04,
            }}
          />
        ))}
      </div>

      <motion.div
        animate={
          playing
            ? {
                scale: [1, 1.04, 1],
                boxShadow: [
                  '0 0 60px rgba(45,212,191,0.25)',
                  '0 0 100px rgba(45,212,191,0.45)',
                  '0 0 60px rgba(45,212,191,0.25)',
                ],
              }
            : {
                scale: [1, 1.02, 1],
                boxShadow: '0 0 48px rgba(45,212,191,0.2)',
              }
        }
        transition={{ duration: playing ? 3.5 : 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 rounded-full"
      >
        <CalmaBreathLogo size={size * 0.55} />
      </motion.div>
    </div>
  )
}
