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
  const cosmicGlowId = `${gradientId}-cosmic`
  const tealGlowId = `${gradientId}-teal`

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
  const outerSpherePx = size * (geometry.outerRadius / geometry.viewExtent)

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
        {/* Deep cosmic-blue ambient field — wide, soft, behind geometry */}
        <motion.div
          className="pointer-events-none absolute rounded-full backdrop-blur-3xl"
          style={{
            width: size * 1.34,
            height: size * 1.34,
            background:
              'radial-gradient(circle, rgba(32, 72, 148, 0.31) 0%, rgba(22, 78, 118, 0.21) 36%, rgba(15, 40, 78, 0.15) 56%, rgba(8, 52, 80, 0.1) 74%, transparent 100%)',
          }}
          animate={{ opacity: [0.44, 0.68, 0.44] }}
          transition={BREATH_CYCLE}
        />
        <motion.div
          className="pointer-events-none absolute rounded-full backdrop-blur-3xl"
          style={{
            width: size * 1.12,
            height: size * 1.12,
            background:
              'radial-gradient(circle, rgba(44, 96, 168, 0.21) 0%, rgba(24, 88, 118, 0.14) 42%, rgba(15, 23, 42, 0.11) 58%, transparent 100%)',
          }}
          animate={{ opacity: [0.36, 0.58, 0.36] }}
          transition={BREATH_CYCLE}
        />

        {/* Subtle teal core blend — low density, nested inside blue field */}
        <motion.div
          className="pointer-events-none absolute rounded-full backdrop-blur-2xl"
          style={{
            width: size * 0.86,
            height: size * 0.86,
            background:
              'radial-gradient(circle, rgba(45, 212, 191, 0.18) 0%, rgba(20, 184, 166, 0.09) 42%, transparent 72%)',
          }}
          animate={{ opacity: [0.24, 0.4, 0.24] }}
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
              className="absolute rounded-full border border-[#2DD4BF]/14"
              style={{
                width: size * scale,
                height: size * scale,
                opacity: 0.18 - index * 0.04,
                ...(index === AMBIENT_RING_SCALES.length - 1
                  ? {
                      borderColor: 'rgba(45, 212, 191, 0.26)',
                      boxShadow:
                        '0 0 10px rgba(20, 184, 166, 0.22), 0 0 38px rgba(45, 212, 191, 0.12)',
                    }
                  : {}),
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
                boxShadow: '0 0 6px rgba(45, 212, 191, 0.55), 0 0 10px rgba(20, 184, 166, 0.28)',
              }}
              animate={{
                opacity: playing ? [0.1, 0.65, 0.15] : [0.08, 0.4, 0.12],
                scale: [0.85, 1.15, 0.9],
                x: [0, Math.cos(rad) * 4, 0],
                y: [0, Math.sin(rad) * 4, 0],
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

        {/* Outermost sphere — whisper-soft cyan halo */}
        <motion.div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: outerSpherePx * 1.1,
            height: outerSpherePx * 1.1,
            border: '1px solid rgba(94, 234, 212, 0.22)',
            boxShadow:
              '0 0 10px rgba(20, 184, 166, 0.22), 0 0 36px rgba(45, 212, 191, 0.14), 0 0 52px rgba(20, 184, 166, 0.08), inset 0 0 24px rgba(45, 212, 191, 0.06)',
          }}
          animate={{ opacity: [0.38, 0.56, 0.38] }}
          transition={BREATH_CYCLE}
        />

        <svg
          viewBox={viewBox}
          className="pointer-events-none relative overflow-visible"
          style={{ width: size, height: size }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a7f3d0" stopOpacity="1" />
              <stop offset="35%" stopColor="#5eead4" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#2DD4BF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0f766e" stopOpacity="0.85" />
            </linearGradient>
            <radialGradient id={cosmicGlowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e4a8a" stopOpacity="0.28" />
              <stop offset="32%" stopColor="#1a5c7a" stopOpacity="0.16" />
              <stop offset="55%" stopColor="#0f172a" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={tealGlowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.21" />
              <stop offset="70%" stopColor="#14b8a6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
            </radialGradient>
            <clipPath id={clipId}>
              <circle cx={0} cy={0} r={geometry.outerRadius} />
            </clipPath>
          </defs>

          <circle
            cx={0}
            cy={0}
            r={geometry.outerRadius * 1.28}
            fill={`url(#${cosmicGlowId})`}
          />
          <circle
            cx={0}
            cy={0}
            r={geometry.outerRadius * 1.06}
            fill={`url(#${tealGlowId})`}
          />

          <g
            clipPath={`url(#${clipId})`}
            style={{ filter: 'drop-shadow(0 0 25px rgba(20, 184, 166, 0.55))' }}
          >
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
            r={geometry.outerRadius * 1.05}
            fill="none"
            stroke="#5eead4"
            strokeWidth={circleRadius * 0.24}
            strokeOpacity={0.18}
          />

          <circle
            cx={0}
            cy={0}
            r={geometry.outerRadius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={circleRadius * 0.09}
            strokeOpacity={0.55}
            style={{
              filter:
                'drop-shadow(0 0 10px rgba(20, 184, 166, 0.22)) drop-shadow(0 0 36px rgba(45, 212, 191, 0.1))',
            }}
          />
        </svg>
      </motion.div>
    </div>
  )
}
