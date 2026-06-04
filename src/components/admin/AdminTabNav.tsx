import { Headphones, Package } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'

const tabs = [
  { to: '/admin/classes', label: 'Classes & meditations', icon: Headphones },
  { to: '/admin/bundles', label: 'Bundles (Packs)', icon: Package },
] as const

export function AdminTabNav() {
  return (
    <nav
      className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border)] bg-[var(--page-bg)]/80 p-1.5"
      aria-label="Admin sections"
    >
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition',
              isActive
                ? 'bg-[var(--accent)] text-[var(--on-accent)] shadow-sm'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]',
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
