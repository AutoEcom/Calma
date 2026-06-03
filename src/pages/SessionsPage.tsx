import { Loader2, Radio } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ClassCard } from '../components/class/ClassCard'
import { CLASS_PUBLIC_SELECT } from '../lib/classSelect'
import type { ClassDetails } from '../lib/classTypes'
import { fetchBookedCountsByClassIds } from '../lib/bookingCounts'
import { supabase } from '../lib/supabase'

export function SessionsPage() {
  const [classes, setClasses] = useState<ClassDetails[]>([])
  const [bookedByClass, setBookedByClass] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const nowIso = new Date().toISOString()
      const { data, error: qErr } = await supabase
        .from('classes')
        .select(CLASS_PUBLIC_SELECT)
        .eq('is_audio_sanctuary', false)
        .neq('session_type', 'guided_meditation')
        .gte('scheduled_at', nowIso)
        .order('scheduled_at', { ascending: true })

      if (cancelled) return
      if (qErr) {
        setError(qErr.message)
        setClasses([])
      } else {
        setError(null)
        const rows = (data ?? []) as ClassDetails[]
        setClasses(rows)
        const counts = await fetchBookedCountsByClassIds(rows.map((r) => r.id))
        if (!cancelled) setBookedByClass(counts)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          <Radio className="h-3.5 w-3.5" />
          Live studio
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">
          Upcoming sessions
        </h1>
        <p className="max-w-xl text-sm text-[var(--text-muted)]">
          Book a seat, join the live room, and practice with instructors in real time.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : classes.length === 0 ? (
        <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-[var(--text-muted)]">
          No live sessions scheduled yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c, i) => (
            <ClassCard key={c.id} cls={c} index={i} bookedCount={bookedByClass[c.id] ?? 0} />
          ))}
        </div>
      )}
    </div>
  )
}
