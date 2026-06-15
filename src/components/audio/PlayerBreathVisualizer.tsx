import { motion } from 'framer-motion'
import { useMemo, useId } from 'react'
import {
  buildFlowerOfLife,
  buildQuantumParticles,
  flowerOuterRadius,
} from './flowerOfLifeGeometry'
import { cn } from '../../lib/utils'

const BREATH_CYCLE = {
  duration: 8,
  repeat: Infinity,
  ease: 'easeInOut' as const,
  times: [0, 0.5, 1] as [number, number, number],
}

const AMBIENT_RING_ROTATION = {
  duration: 90,
  repeat: Infinity,
  ease: 'linear' as const,
}

const AMBIENT_RING_SCALES = [1.08, 1.18, 1.28]

type Props = {
  playing?: boolean
  size?: number
  className?: string
}

export function PlayerBreathVisualizer({ playing = false, size = 220, className }: Props) {
  const gradientId = useId().replace(/:/g, '')
  const clipId = `${gradientId}-clip`
  const glowId = `${gradientId}-glow`

  const circleRadius = size * 0.1
  const geometry = useMemo(() => {
    const maxRing = 3
    const circles = buildFlowerOfLife(circleRadius, 0, 0, maxRing)
    const outerRadius = flowerOuterRadius(circleRadius, maxRing)
    const particles = buildQuantumParticles(14)
    const viewExtent = outerRadius * 1.22
    return { circles, outerRadius, particles, viewExtent, maxRing }
  }, [circleRadius])

  const viewBox = `${-geometry.viewExtent} ${-geometry.viewExtent} ${geometry.viewExtent * 2} ${geometry.viewExtent * 2}`

  return (
    <div
      className={cn(
        'relative mx-auto flex shrink-0 items-center justify-center overflow-visible',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <motion.div
        className="relative flex items-center justify-center overflow-visible"
        style={{ width: size, height: size }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={BREATH_CYCLE}
      >
        {/* Wide cosmic halo — radiates into the upper-center void */}
        <motion.div
          className="pointer-events-none absolute rounded-full backdrop-blur-3xl"
          style={{
            width: size * 1.75,
            height: size * 1.75,
            background:
              'radial-gradient(circle, rgba(45, 212, 191, 0.38) 0%, rgba(20, 184, 166, 0.18) 42%, rgba(15, 118, 110, 0.06) 68%, transparent 100%)',
          }}
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={BREATH_CYCLE}
        />
        <motion.div
          className="pointer-events-none absolute rounded-full bg-[#14b8a6]/30 backdrop-blur-3xl"
          style={{ width: size * 1.28, height: size * 1.28 }}
          animate={{ opacity: [0.28, 0.52, 0.28] }}
          transition={BREATH_CYCLE}
        />
        <motion.div
          className="pointer-events-none absolute rounded-full bg-[#2DD4BF]/22 backdrop-blur-3xl"
          style={{ width: size * 0.98, height: size * 0.98 }}
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={BREATH_CYCLE}
        />

        <motion.div
          className="pointer-events-none absolute flex items-center justify-center"
          style={{ width: size, height: size }}
          animate={{ rotate: 360 }}
          transition={AMBIENT_RING_ROTATION}
        >
          {AMBIENT_RING_SCALES.map((scale, index) => (
            <div
              key={scale}
              className="absolute rounded-full border border-[#2DD4BF]/22"
              style={{
                width: size * scale,
                height: size * scale,
                opacity: 0.32 - index * 0.06,
                boxShadow: '0 0 24px rgba(20, 184, 166, 0.12)',
              }}
            />
          ))}
        </motion.div>

        {geometry.particles.map((particle) => {
          const rad = (particle.angle * Math.PI) / 180
          const orbit = geometry.outerRadius * particle.radiusRatio * (size / (geometry.viewExtent * 2))
          const x = Math.cos(rad) * orbit
          const y = Math.sin(rad) * orbit

          return (
            <motion.span
              key={particle.id}
              className="pointer-events-none absolute rounded-full bg-[#99f6e4]"
              style={{
                width: particle.size,
                height: particle.size,
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                marginLeft: -particle.size / 2,
                marginTop: -particle.size / 2,
                boxShadow: '0 0 8px rgba(45, 212, 191, 0.85), 0 0 14px rgba(20, 184, 166, 0.45)',
              }}
              animate={{
                opacity: playing ? [0.15, 0.85, 0.2] : [0.12, 0.55, 0.15],
                scale: [0.85, 1.25, 0.9],
                x: [0, Math.cos(rad) * 6, 0],
                y: [0, Math.sin(rad) * 6, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: particle.delay,
              }}
            />
          )
        })}

        <svg
          viewBox={viewBox}
          className="pointer-events-none relative overflow-visible"
          style={{
            width: size,
            height: size,
            filter:
              'drop-shadow(0 0 25px rgba(20, 184, 166, 0.55)) drop-shadow(0 0 50px rgba(20, 184, 166, 0.75)) drop-shadow(0 0 95px rgba(20, 184, 166, 0.38))',
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a7f3d0" stopOpacity="1" />
              <stop offset="35%" stopColor="#5eead4" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#2DD4BF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0f766e" stopOpacity="0.85" />
            </linearGradient>
            <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.55" />
              <stop offset="45%" stopColor="#14b8a6" stopOpacity="0.32" />
              <stop offset="78%" stopColor="#14b8a6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
            </radialGradient>
            <filter id={`${gradientId}-ambient`} x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="18" result="ambientBlur" />
              <feColorMatrix
                in="ambientBlur"
                type="matrix"
                values="0 0 0 0 0.06  0 0 0 0 0.78  0 0 0 0 0.68  0 0 0 0.65 0"
              />
            </filter>
            <clipPath id={clipId}>
              <circle cx={0} cy={0} r={geometry.outerRadius} />
            </clipPath>
          </defs>

          <circle
            cx={0}
            cy={0}
            r={geometry.outerRadius * 1.65}
            fill={`url(#${glowId})`}
            filter={`url(#${gradientId}-ambient)`}
          />

          <circle
            cx={0}
            cy={0}
            r={geometry.outerRadius * 1.08}
            fill={`url(#${glowId})`}
            opacity={0.85}
          />

          <g clipPath={`url(#${clipId})`}>
            {[0.16, 0.3, 0.48].map((opacity, layer) => (
              <g key={opacity}>
                {geometry.circles.map((circle) => (
                  <circle
                    key={`${layer}-${circle.cx}-${circle.cy}`}
                    cx={circle.cx}
                    cy={circle.cy}
                    r={circle.r}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={circleRadius * (0.065 + layer * 0.012)}
                    strokeOpacity={opacity + circle.ring * 0.035}
                  />
                ))}
              </g>
            ))}
          </g>

          <circle
            cx={0}
            cy={0}
            r={geometry.outerRadius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={circleRadius * 0.09}
            strokeOpacity={0.55}
          />
        </svg>
      </motion.div>
    </div>
  )
}
