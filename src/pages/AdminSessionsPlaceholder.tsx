import { Navigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

/** Placeholder until the full Sessions Management UI is migrated. */
export function AdminSessionsPlaceholder() {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-[var(--text-muted)]">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: '/admin/sessions' }} />
  }

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sessions management</h1>
      <p className="max-w-2xl text-[var(--text-muted)]">
        Advanced class creator, storage uploads, and revenue views will live here.
        Your Supabase <code className="text-[var(--accent)]">classes</code> table
        is ready; instructor scoping will follow once{' '}
        <code className="text-[var(--accent)]">instructor_id</code> or equivalent
        is added—or by matching{' '}
        <code className="text-[var(--accent)]">instructor_name</code> to staff
        profiles.
      </p>
    </div>
  )
}
