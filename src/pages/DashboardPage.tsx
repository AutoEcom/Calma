import {
  Calendar,
  ChevronRight,
  Clock,
  Headphones,
  Loader2,
  Play,
  Radio,
  Waves,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { NeonPrimaryLink } from '../components/ui/NeonGlow'
import { formatEurFromCents } from '../lib/formatPrice'
import {
  isSessionLive,
  isSessionPast,
  isSessionUpcoming,
} from '../lib/classSession'
import { classDetailPath, isGuidedMeditation, sanctuaryDetailPath } from '../lib/classKind'
import { parseAudioCredits } from '../lib/audioSanctuary'
import { supabase } from '../lib/supabase'
import { useAuth } from '../providers/AuthProvider'
import { calmaHeading, calmaMuted, zenFloat, zenPanel } from '../lib/designSystem'
import { cn } from '../lib/utils'

type ClassSummary = {
  id: string
  slug: string | null
  title: string
  scheduled_at: string
  duration_minutes: number
  image_url: string | null
  audio_cover_art_url: string | null
  instructor_name: string
  price_in_cents: number
  video_url: string | null
  mux_status: string | null
  mux_recording_playback_id: string | null
  session_type: string | null
  is_audio_sanctuary: boolean | null
  audio_credits: unknown
  badge: string | null
}

type AccessWithClass = {
  id: string
  granted_at: string | null
  access_granted: string | null
  classes: ClassSummary | null
}

type WorkspaceTab = 'live' | 'audio'
type LiveFilterTab = 'upcoming' | 'past' | 'live'

export function DashboardPage() {
  const { user, member, loading } = useAuth()
  const [accessRows, setAccessRows] = useState<AccessWithClass[]>([])
  const [accessLoading, setAccessLoading] = useState(true)
  const [accessError, setAccessError] = useState<string | null>(null)
  const [workspace, setWorkspace] = useState<WorkspaceTab>('live')
  const [liveFilter, setLiveFilter] = useState<LiveFilterTab>('upcoming')
  const [nowTick, setNowTick] = useState(() => Date.now())

  useEffect(() => {
    const t = window.setInterval(() => setNowTick(Date.now()), 30_000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setAccessRows([])
      setAccessLoading(false)
      setAccessError(null)
      return
    }
    let cancelled = false
    ;(async () => {
      setAccessLoading(true)
      setAccessError(null)
      const { data, error } = await supabase
        .from('user_access')
        .select(
          `
          id,
          granted_at,
          access_granted,
          classes (
            id,
            slug,
            title,
            scheduled_at,
            duration_minutes,
            image_url,
            audio_cover_art_url,
            instructor_name,
            price_in_cents,
            video_url,
            mux_status,
            mux_recording_playback_id,
            session_type,
            is_audio_sanctuary,
            audio_credits,
            badge
          )
        `,
        )
        .eq('member_id', user.id)
        .not('access_granted', 'is', null)

      if (cancelled) return
      if (error) {
        console.error('dashboard user_access', error.message)
        setAccessError(error.message)
        setAccessRows([])
      } else {
        const raw = (data ?? []) as AccessWithClass[]
        setAccessRows(raw.filter((r) => r.classes != null))
      }
      setAccessLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const liveRows = useMemo(
    () => accessRows.filter((r) => r.classes && !isGuidedMeditation(r.classes)),
    [accessRows],
  )

  const audioRows = useMemo(
    () => accessRows.filter((r) => r.classes && isGuidedMeditation(r.classes)),
    [accessRows],
  )

  const filteredLiveRows = useMemo(() => {
    return liveRows.filter((r) => {
      const c = r.classes!
      const live = isSessionLive(c.scheduled_at, c.duration_minutes, nowTick)
      const past = isSessionPast(c.scheduled_at, c.duration_minutes, nowTick)
      const upcoming = isSessionUpcoming(c.scheduled_at, nowTick)
      if (liveFilter === 'live') return live
      if (liveFilter === 'past') return past
      return upcoming
    })
  }, [liveRows, liveFilter, nowTick])

  const liveNowCount = useMemo(
    () =>
      liveRows.filter((r) =>
        r.classes
          ? isSessionLive(r.classes.scheduled_at, r.classes.duration_minutes, nowTick)
          : false,
      ).length,
    [liveRows, nowTick],
  )

  const upcomingLive = useMemo(
    () =>
      liveRows
        .filter((r) => r.classes && isSessionUpcoming(r.classes.scheduled_at, nowTick))
        .sort(
          (a, b) =>
            new Date(a.classes!.scheduled_at).getTime() -
            new Date(b.classes!.scheduled_at).getTime(),
        ),
    [liveRows, nowTick],
  )

  const nextSession = upcomingLive[0]?.classes ?? null

  const liveTabs: { id: LiveFilterTab; label: string }[] = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'live', label: 'Live now' },
    { id: 'past', label: 'Past' },
  ]

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-[var(--text-muted)]">
        Loading your space…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: '/dashboard' }} />
  }

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="min-w-0">
          <h1 className={cn('text-2xl font-semibold sm:text-3xl', calmaHeading)}>
            Welcome back
            {member?.first_name ? (
              <>
                {', '}
                <span className="text-[var(--accent)]">{member.first_name}</span>
              </>
            ) : null}
          </h1>
          <p className={cn('mt-1 text-sm', calmaMuted)}>Your private workspace</p>
        </div>
        <NeonPrimaryLink to="/sessions" className="w-full sm:w-auto">
          Book a live session
        </NeonPrimaryLink>
      </div>

      {accessError && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Could not load your library: {accessError}
        </p>
      )}

      <div className={cn('p-1.5', zenPanel)}>
        <div className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={() => setWorkspace('live')}
            className={cn(
              'flex min-h-[44px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition sm:flex-row sm:gap-2 sm:px-4 sm:text-sm',
              workspace === 'live'
                ? 'bg-[var(--accent)] text-[var(--on-accent)] shadow-[0_0_20px_-4px_rgba(45,212,191,0.45)]'
                : 'text-slate-600 hover:bg-white/40 dark:text-neutral-400 dark:hover:bg-white/[0.04]',
            )}
          >
            <Radio className="h-4 w-4 shrink-0" />
            <span className="text-center leading-tight sm:hidden">Live</span>
            <span className="hidden sm:inline">My Live Bookings</span>
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] tabular-nums dark:bg-white/10">
              {liveRows.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setWorkspace('audio')}
            className={cn(
              'flex min-h-[44px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition sm:flex-row sm:gap-2 sm:px-4 sm:text-sm',
              workspace === 'audio'
                ? 'bg-[var(--accent)] text-[var(--on-accent)] shadow-[0_0_20px_-4px_rgba(45,212,191,0.45)]'
                : 'text-slate-600 hover:bg-white/40 dark:text-neutral-400 dark:hover:bg-white/[0.04]',
            )}
          >
            <Headphones className="h-4 w-4 shrink-0" />
            <span className="text-center leading-tight sm:hidden">Sanctuary</span>
            <span className="hidden sm:inline">Audio Sanctuary</span>
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] tabular-nums dark:bg-white/10">
              {audioRows.length}
            </span>
          </button>
        </div>
      </div>

      {workspace === 'live' ? (
        <>
          <div className={cn('p-1.5', zenFloat)}>
            <div className="flex flex-wrap gap-1">
              {liveTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setLiveFilter(t.id)}
                  className={cn(
                    'rounded-xl px-4 py-2 text-xs font-medium transition',
                    liveFilter === t.id
                      ? 'bg-[var(--page-bg)] text-[var(--text)] ring-1 ring-[var(--accent)]/30'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]',
                  )}
                >
                  {t.label}
                  {t.id === 'live' && liveNowCount > 0 && (
                    <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className={cn('p-5 sm:p-6', zenPanel)}>
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)]" />
              <h2 className={cn('mt-4 text-lg font-medium', calmaHeading)}>Your next booking</h2>
              {accessLoading ? (
                <div className="mt-8 flex justify-center text-[var(--text-muted)]">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                </div>
              ) : nextSession ? (
                <div className="mt-6 space-y-4">
                  {isSessionLive(
                    nextSession.scheduled_at,
                    nextSession.duration_minutes,
                    nowTick,
                  ) && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      Live now
                    </span>
                  )}
                  <div className="flex gap-4">
                    {nextSession.image_url ? (
                      <img
                        src={nextSession.image_url}
                        alt=""
                        className="h-24 w-36 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-36 shrink-0 items-center justify-center rounded-xl bg-[var(--page-bg)] text-xs text-[var(--text-muted)]">
                        Calma
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--text)]">{nextSession.title}</p>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {nextSession.instructor_name}
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <Calendar className="h-3.5 w-3.5 text-[var(--accent)]" />
                        {new Date(nextSession.scheduled_at).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={classDetailPath(nextSession)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
                  >
                    Open session
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <>
                  <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                    No upcoming live bookings.
                  </p>
                  <Link
                    to="/sessions"
                    className="mt-4 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
                  >
                    Browse sessions →
                  </Link>
                </>
              )}
            </div>

            <div className={cn('p-5 sm:p-6', zenPanel)}>
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-[var(--accent)]" />
                <h2 className={cn('text-lg font-medium', calmaHeading)}>All live bookings</h2>
              </div>
              {accessLoading ? (
                <div className="mt-8 flex justify-center text-[var(--text-muted)]">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                </div>
              ) : filteredLiveRows.length === 0 ? (
                <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                  Nothing in this view yet.
                </p>
              ) : (
                <ul className="mt-4 max-h-[min(60vh,480px)] space-y-2 overflow-y-auto pr-1">
                  {filteredLiveRows.map((row) => {
                    const c = row.classes!
                    const live = isSessionLive(c.scheduled_at, c.duration_minutes, nowTick)
                    const past = isSessionPast(c.scheduled_at, c.duration_minutes, nowTick)
                    const muxFinished =
                      c.mux_status?.toLowerCase() === 'finished' &&
                      !!c.mux_recording_playback_id
                    const muxLiveActive = c.mux_status?.toLowerCase() === 'active'
                    return (
                      <li key={row.id}>
                        <div
                          className={cn(
                            'flex flex-col gap-2 rounded-xl border px-3 py-3 sm:flex-row sm:items-center',
                            live
                              ? 'border-emerald-500/40 bg-emerald-500/5'
                              : 'border-[var(--border)] bg-[var(--page-bg)]/40',
                          )}
                        >
                          <Link
                            to={classDetailPath(c)}
                            className="flex min-w-0 flex-1 items-center gap-3"
                          >
                            {c.image_url ? (
                              <img
                                src={c.image_url}
                                alt=""
                                className="h-14 w-20 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-[var(--page-bg)] text-[10px] text-[var(--text-muted)]">
                                —
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-medium text-[var(--text)]">
                                  {c.title}
                                </p>
                                {live && (
                                  <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                                    Live
                                  </span>
                                )}
                                {muxFinished && (
                                  <span className="rounded-full border border-[var(--accent-warm)]/40 bg-[var(--accent-warm)]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--accent-warm)]">
                                    Replay
                                  </span>
                                )}
                              </div>
                              <p className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                <Clock className="h-3 w-3 shrink-0" />
                                {new Date(c.scheduled_at).toLocaleString(undefined, {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })}
                                · {formatEurFromCents(c.price_in_cents)}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                          </Link>
                          {muxFinished ? (
                            <Link
                              to={`${classDetailPath(c)}/live`}
                              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-[var(--accent-warm)]/50 bg-[var(--accent-warm)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent-warm)]"
                            >
                              <Play className="h-3.5 w-3.5" />
                              Watch replay
                            </Link>
                          ) : live && muxLiveActive ? (
                            <Link
                              to={`${classDetailPath(c)}/live`}
                              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400"
                            >
                              <Radio className="h-3.5 w-3.5" />
                              Join live
                            </Link>
                          ) : past && c.video_url ? (
                            <a
                              href={c.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)]"
                            >
                              <Play className="h-3.5 w-3.5" />
                              Recording
                            </a>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={cn('w-full min-w-0 p-5 sm:p-6', zenPanel)}>
          <div className="flex items-center gap-2">
            <Headphones className="h-5 w-5 shrink-0 text-[var(--accent)]" />
            <h2 className={cn('text-lg font-medium', calmaHeading)}>Unlocked meditations</h2>
          </div>
          <p className={cn('mt-1 text-sm', calmaMuted)}>
            On-demand audio — listen anytime from your library.
          </p>
          {accessLoading ? (
            <div className="mt-10 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
            </div>
          ) : audioRows.length === 0 ? (
            <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
              No unlocked meditations yet.{' '}
              <Link to="/sanctuary" className="text-[var(--accent)] hover:underline">
                Explore Audio Sanctuary
              </Link>
            </p>
          ) : (
            <ul className="mt-6 grid w-full min-w-0 grid-cols-1 gap-3 lg:grid-cols-2">
              {audioRows.map((row) => {
                const c = row.classes!
                const credits = parseAudioCredits(c.audio_credits)
                const cover = c.audio_cover_art_url ?? c.image_url
                const freq = credits.frequency ?? credits.studio
                return (
                  <li key={row.id} className="min-w-0">
                    <Link
                      to={sanctuaryDetailPath(c)}
                      className={cn(
                        'group flex w-full max-w-full min-w-0 flex-col gap-3 overflow-hidden p-4 transition',
                        zenFloat,
                        'hover:ring-1 hover:ring-[var(--accent)]/30',
                      )}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        {cover ? (
                          <img
                            src={cover}
                            alt=""
                            className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-neutral-950/60 sm:h-20 sm:w-20">
                            <Waves className="h-6 w-6 text-[var(--accent)]/60" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-[var(--accent)] dark:text-neutral-100">
                            {c.title}
                          </p>
                          <p className={cn('mt-1 text-xs', calmaMuted)}>
                            {c.instructor_name}
                          </p>
                        </div>
                        <Play className="mt-1 h-5 w-5 shrink-0 text-[var(--accent)] opacity-70 group-hover:opacity-100" />
                      </div>
                      <p className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-slate-500 dark:text-neutral-500">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[var(--accent)]">
                          <Headphones className="h-3 w-3" />
                          Audio
                        </span>
                        <span>{c.duration_minutes} min</span>
                        {freq && <span className="truncate">{freq}</span>}
                      </p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
