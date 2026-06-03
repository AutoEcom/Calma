import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '../lib/utils'

type ThemeChoice = 'light' | 'dark' | 'system'

const OPTIONS: { id: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
]

export function ThemePreferenceSwitch() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const active = (mounted ? theme : 'system') as ThemeChoice

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 ring-1 ring-slate-200/50 dark:bg-neutral-950/50 dark:ring-white/[0.06]">
          {resolvedTheme === 'dark' ? (
            <Moon className="h-5 w-5 text-[var(--accent)]" />
          ) : (
            <Sun className="h-5 w-5 text-amber-600" />
          )}
        </span>
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-neutral-100">Appearance</p>
          <p className="text-xs text-slate-600 dark:text-neutral-400">
            {mounted
              ? active === 'system'
                ? `System (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`
                : active === 'dark'
                  ? 'Dark mode'
                  : 'Light mode'
              : 'Loading…'}
          </p>
        </div>
      </div>

      <div
        className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100/80 p-1 dark:bg-neutral-950/60"
        role="radiogroup"
        aria-label="Theme preference"
      >
        {OPTIONS.map((opt) => {
          const Icon = opt.icon
          const selected = active === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!mounted}
              onClick={() => setTheme(opt.id)}
              className={cn(
                'flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-lg px-2 py-2.5 text-xs font-medium transition',
                selected
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-[var(--accent)]/30 dark:bg-neutral-800 dark:text-neutral-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200',
                !mounted && 'opacity-50',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
