import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  COOKIE_CONSENT_KEY,
  hasCookieConsent,
  setCookieConsent,
} from '../../lib/cookieConsent'
import { cn } from '../../lib/utils'

function ShimmerStar({
  className,
  delay = 0,
}: {
  className?: string
  delay?: number
}) {
  return (
    <motion.svg
      viewBox="0 0 12 12"
      className={cn('pointer-events-none absolute h-2.5 w-2.5 text-[#5eead4]', className)}
      animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay }}
      aria-hidden
    >
      <path
        d="M6 0.5L6.9 4.4L10.8 5.3L6.9 6.2L6 10.1L5.1 6.2L1.2 5.3L5.1 4.4L6 0.5Z"
        fill="currentColor"
      />
    </motion.svg>
  )
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setVisible(!hasCookieConsent())
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === COOKIE_CONSENT_KEY) {
        setVisible(!hasCookieConsent())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function accept() {
    setCookieConsent()
    setVisible(false)
  }

  if (!mounted) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Cookie consent"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-4 sm:pb-6"
        >
          <div
            className={cn(
              'pointer-events-auto flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-white/10',
              'bg-black/75 px-5 py-4 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.6)] backdrop-blur-xl',
              'sm:flex-row sm:items-center sm:gap-6 sm:py-4',
            )}
          >
            <p className="flex-1 text-xs leading-relaxed text-neutral-400 sm:text-sm">
              We use essential security and analytics cookies to optimize your spatial audio
              experience. By continuing to explore the Sanctuary, you agree to our policies.
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                to="/privacy#cookies"
                className="text-xs font-medium text-white/45 underline decoration-white/20 underline-offset-4 transition hover:text-white/70 hover:decoration-[var(--accent)]/50"
              >
                Learn More
              </Link>
              <div className="relative">
                <ShimmerStar className="-left-2 -top-1.5" delay={0} />
                <ShimmerStar className="-right-1.5 -top-2" delay={0.6} />
                <ShimmerStar className="-bottom-1.5 right-1" delay={1.1} />
                <button
                  type="button"
                  onClick={accept}
                  className={cn(
                    'rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/15 px-5 py-2',
                    'text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/25',
                  )}
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
