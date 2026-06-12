import { Link, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CosmicBackground } from './CosmicBackground'
import { CookieBanner } from './CookieBanner'
import { SiteFooter } from './SiteFooter'
import { CalmaLogo } from './CalmaLogo'
import { HeaderAccountMenu, HeaderDashboardButton } from './HeaderAccountMenu'
import { useAuth } from '../../providers/AuthProvider'
import { calmaPage } from '../../lib/designSystem'
import { cn } from '../../lib/utils'

export function AppLayout() {
  const { user, role } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={cn('relative flex min-h-screen flex-col overflow-x-hidden', calmaPage)}>
      <CosmicBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header
          className={cn(
            'sticky top-0 z-50 transition-[background,backdrop-filter,box-shadow] duration-300',
            scrolled
              ? 'border-b border-neutral-200/40 bg-neutral-50/80 shadow-sm backdrop-blur-xl backdrop-saturate-150 dark:border-white/[0.06] dark:bg-black/55 dark:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.45)]'
              : 'bg-neutral-50/60 backdrop-blur-md dark:bg-black/40',
          )}
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4">
            <CalmaLogo />

            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-800 md:flex dark:text-neutral-400">
              <Link
                to="/sessions"
                className="transition hover:text-slate-900 dark:hover:text-neutral-100"
              >
                Sessions
              </Link>
              <Link
                to="/sanctuary"
                className="transition hover:text-slate-900 dark:hover:text-neutral-100"
              >
                Sanctuary
              </Link>
              <Link
                to="/insights"
                className="transition hover:text-slate-900 dark:hover:text-neutral-100"
              >
                Insights
              </Link>
            </nav>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  {role === 'admin' && (
                    <Link
                      to="/admin/classes"
                      className="hidden rounded-full bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-medium text-[var(--accent)] ring-1 ring-[var(--accent)]/25 hover:bg-[var(--accent)]/15 sm:inline-flex"
                    >
                      Admin
                    </Link>
                  )}
                  <HeaderDashboardButton />
                  <HeaderAccountMenu />
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-800 transition hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--on-accent)] shadow-sm hover:opacity-90"
                  >
                    Join
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-8">
          <Outlet />
        </main>

        <SiteFooter />
        <CookieBanner />
      </div>
    </div>
  )
}
