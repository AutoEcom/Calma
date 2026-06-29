import { AnimatePresence, motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

const STEREO_UNLOCK_MESSAGE =
  'За да отключите това изживяване в 3D Dolby Atmos пространствен звук, моля свържете своите AirPods (или съвместими Dolby Atmos слушалки) и се уверете, че използвате браузъра Safari на вашето Apple устройство.'

const ATMOS_ACTIVE_MESSAGE =
  'Пространственият 3D Dolby Atmos звук е активен. Насладете се на дълбоко и пълно потапяне в медитацията.'

type Props = {
  mode: 'atmos' | 'stereo'
  className?: string
}

export function StreamQualityBadge({ mode, className }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const isAtmos = mode === 'atmos'
  const message = isAtmos ? ATMOS_ACTIVE_MESSAGE : STEREO_UNLOCK_MESSAGE

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative mt-4 inline-flex flex-col items-center', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          'group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 transition',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF]/50',
          isAtmos
            ? 'sanctuary-atmos-glow border-[#2DD4BF]/35 bg-[#2DD4BF]/10 text-[11px] font-bold uppercase tracking-[0.38em] text-[#a7f3d0] hover:border-[#2DD4BF]/55 hover:bg-[#2DD4BF]/15'
            : 'border-white/12 bg-white/[0.04] text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45 hover:border-white/20 hover:bg-white/[0.07] hover:text-white/60',
        )}
      >
        <span>{isAtmos ? 'Dolby Atmos' : 'Studio Master Stereo'}</span>
        <Info
          className={cn(
            'h-3.5 w-3.5 shrink-0 opacity-60 transition group-hover:opacity-90',
            isAtmos ? 'text-[#a7f3d0]' : 'text-white/50',
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-live="polite"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={cn(
              'absolute top-full z-30 mt-3 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border p-4 text-left shadow-[0_20px_48px_-12px_rgba(0,0,0,0.85)] backdrop-blur-2xl',
              isAtmos
                ? 'border-[#2DD4BF]/25 bg-black/90'
                : 'border-white/12 bg-black/88',
            )}
          >
            <p
              className={cn(
                'text-xs leading-relaxed',
                isAtmos ? 'text-[#ccfbf1]/90' : 'text-white/65',
              )}
            >
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
