import { Link, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CosmicBackground } from './CosmicBackground'
import { SiteFooter } from './SiteFooter'
import { CalmaLogo } from './CalmaLogo'
import { useAuth } from '../../providers/AuthProvider'
import { calmaPage } from '../../lib/designSystem'
import { cn } from '../../lib/utils'

export function AppLayout() {
  const { user, member, role } = useAuth()
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
              ? 'bg-slate-50/70 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.12)] backdrop-blur-xl backdrop-saturate-150 dark:bg-black/55 dark:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.45)]'
              : 'bg-slate-50/50 backdrop-blur-md dark:bg-black/40',
          )}
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4">
            <CalmaLogo />

            <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex dark:text-neutral-400">
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
                to="/#community"
                className="transition hover:text-slate-900 dark:hover:text-neutral-100"
              >
                Community
              </Link>
            </nav>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {user ? (
                <>
                  {role === 'admin' && (
                    <Link
                      to="/admin/classes"
                      className="rounded-full bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-medium text-[var(--accent)] ring-1 ring-[var(--accent)]/25 hover:bg-[var(--accent)]/15"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm ring-1 ring-slate-200/60 hover:ring-[var(--accent)]/30 dark:bg-neutral-900/50 dark:text-neutral-200 dark:ring-white/[0.06]"
                  >
                    {member?.first_name ? `Hi, ${member.first_name}` : 'Dashboard'}
                  </Link>
                  <Link
                    to="/profile"
                    title="Profile & billing"
                    className={cn(
                      'flex items-center gap-2 rounded-full bg-white/70 py-1 pl-1 pr-3 shadow-sm ring-1 ring-[var(--accent)]/25',
                      'transition hover:ring-[var(--accent)]/50 dark:bg-neutral-900/55 dark:ring-[var(--accent)]/35',
                    )}
                  >
                    {member?.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-[var(--accent)]/20"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)]/30 to-[var(--accent-warm)]/20 text-xs font-bold text-[var(--accent)]">
                        {(member?.first_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
                      </div>
                    )}
                    <span className="hidden text-xs font-semibold text-slate-900 sm:inline dark:text-neutral-100">
                      Profile
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-100"
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
      </div>
    </div>
  )
}
