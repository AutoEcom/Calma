import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '../../lib/utils'

/** Stylized Flower of Life — overlapping circles with scroll-reactive trace animation. */
export function FlowerOfLifeBackground({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [0.08, 0.25, 0.22, 0.1])
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1.08])

  const r = 28
  const centers: [number, number][] = [
    [100, 100],
    [100 + r, 100],
    [100 - r, 100],
    [100 + r / 2, 100 - r * 0.866],
    [100 - r / 2, 100 - r * 0.866],
    [100 + r / 2, 100 + r * 0.866],
    [100 - r / 2, 100 + r * 0.866],
    [100 + r * 1.5, 100 - r * 0.433],
    [100 - r * 1.5, 100 - r * 0.433],
    [100 + r * 1.5, 100 + r * 0.433],
    [100 - r * 1.5, 100 + r * 0.433],
    [100 + r * 2, 100],
    [100 - r * 2, 100],
  ]

  return (
    <div ref={ref} className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute left-1/2 top-1/2 h-[min(120vw,640px)] w-[min(120vw,640px)] -translate-x-1/2 -translate-y-1/2"
        style={{ opacity, scale }}
        aria-hidden
      >
        {centers.map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#2dd4bf"
            strokeWidth="0.35"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.55 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{
              duration: 2.2,
              delay: i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
        <motion.circle
          cx="100"
          cy="100"
          r={r * 2}
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="0.25"
          strokeOpacity="0.4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 3, ease: 'easeInOut' }}
        />
      </motion.svg>
    </div>
  )
}
