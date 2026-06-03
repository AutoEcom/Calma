import { CreditCard, LayoutDashboard, LogOut, Settings2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MemberAvatar } from '../ui/MemberAvatar'
import { useAuth } from '../../providers/AuthProvider'
import { cn } from '../../lib/utils'

export function HeaderAccountMenu() {
  const { member, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          'rounded-full p-0.5 transition',
          'ring-2 ring-slate-200/70 hover:ring-[var(--accent)]/45 dark:ring-white/10',
          open && 'ring-[var(--accent)]/50',
        )}
      >
        <MemberAvatar src={member?.avatar_url} size="sm" ringClassName="ring-0" />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 z-[60] mt-2 min-w-[220px] overflow-hidden rounded-2xl py-1.5',
            'border border-neutral-200/50 bg-white/75 shadow-lg backdrop-blur-md',
            'dark:border-white/10 dark:bg-neutral-950/85',
          )}
        >
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-800 transition hover:bg-slate-100/80 dark:text-neutral-200 dark:hover:bg-white/[0.06]"
          >
            <Settings2 className="h-4 w-4 shrink-0 text-[var(--accent)]" />
            Profile &amp; preferences
          </Link>
          <Link
            to="/profile?tab=billing"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-800 transition hover:bg-slate-100/80 dark:text-neutral-200 dark:hover:bg-white/[0.06]"
          >
            <CreditCard className="h-4 w-4 shrink-0 text-[var(--accent)]" />
            Billing portal
          </Link>
          <div className="my-1.5 h-px bg-neutral-200/70 dark:bg-white/[0.08]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              void signOut()
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-neutral-500 transition hover:bg-red-500/5 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export function HeaderDashboardButton() {
  return (
    <Link
      to="/dashboard"
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold sm:text-sm',
        'bg-[var(--accent)] text-[var(--on-accent)] shadow-[0_0_28px_rgba(45,212,191,0.28)]',
        'ring-1 ring-[var(--accent)]/40 transition hover:brightness-110',
      )}
    >
      <LayoutDashboard className="h-4 w-4 shrink-0" />
      <span>Dashboard</span>
    </Link>
  )
}
