import MuxPlayer from '@mux/mux-player-react'
import { motion } from 'framer-motion'
import { Loader2, Maximize2, Minimize2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ConnectionSignal, type ConnectionQuality } from '../components/live/ConnectionSignal'
import { LiveReactionBurst } from '../components/live/LiveReactionBurst'
import { LiveWaitingRoom } from '../components/live/LiveWaitingRoom'
import { NeonCardGlow } from '../components/ui/NeonGlow'
import { CLASS_PUBLIC_SELECT } from '../lib/classSelect'
import { isGuidedMeditation, sanctuaryDetailPath, classDetailPath } from '../lib/classKind'
import { supabase } from '../lib/supabase'
import { fetchUserAccessForClass, hasAccess } from '../lib/classAccess'
import type { ClassDetails } from '../lib/classTypes'
import { useDisplayViewerCount } from '../hooks/useDisplayViewerCount'
import { useAuth } from '../providers/AuthProvider'
import { badgeOnImageDark, badgeOnImageLight, badgeOnImageWarm } from '../lib/solidBadge'
import { cn } from '../lib/utils'

function bufferQuality(video: HTMLVideoElement | null): ConnectionQuality {
  if (!video) return 'fair'
  if (video.readyState < 2) return 'poor'
  const ranges = video.buffered
  if (ranges.length === 0) return 'poor'
  const ahead = ranges.end(ranges.length - 1) - video.currentTime
  if (ahead >= 2.5) return 'good'
  if (ahead >= 0.4) return 'fair'
  return 'poor'
}

async function fetchClassBySlugOrId(slugOrId: string): Promise<ClassDetails | null> {
  const bySlug = await supabase
    .from('classes')
    .select(CLASS_PUBLIC_SELECT)
    .eq('slug', slugOrId)
    .maybeSingle()
  if (bySlug.data) return bySlug.data as ClassDetails
  const byId = await supabase
    .from('classes')
    .select(CLASS_PUBLIC_SELECT)
    .eq('id', slugOrId)
    .maybeSingle()
  return (byId.data as ClassDetails | null) ?? null
}

export function ClassLivePage() {
  const { slug: routeSlug } = useParams<{ slug: string }>()
  const id = routeSlug
  const { user, loading: authLoading } = useAuth()
  const [cls, setCls] = useState<ClassDetails | null | undefined>(undefined)
  const [accessRow, setAccessRow] = useState<Awaited<
    ReturnType<typeof fetchUserAccessForClass>
  > | null>(null)
  const [checked, setChecked] = useState(false)
  const [theatreMode, setTheatreMode] = useState(false)
  const [connection, setConnection] = useState<ConnectionQuality>('fair')
  const [playerPlaying, setPlayerPlaying] = useState(false)

  const playerShellRef = useRef<HTMLDivElement>(null)

  const muxStatus = cls?.mux_status?.toLowerCase() ?? 'idle'
  const isLiveActive = muxStatus === 'active'
  const isFinished = muxStatus === 'finished'
  const recordingPlaybackId = cls?.mux_recording_playback_id ?? null
  const isVod = isFinished && !!recordingPlaybackId
  const playbackId = isVod ? recordingPlaybackId : cls?.mux_playback_id ?? null

  const showWaitingRoom = !isFinished && !isLiveActive && !playerPlaying
  const recordingProcessing = isFinished && !recordingPlaybackId

  const { display: viewerCount } = useDisplayViewerCount(isLiveActive && !isVod)

  const refreshClass = useCallback(async () => {
    if (!id) return
    const data = await fetchClassBySlugOrId(id)
    if (data) setCls(data)
  }, [id])

  useEffect(() => {
    if (!id) {
      setCls(null)
      return
    }
    let cancelled = false
    ;(async () => {
      const data = await fetchClassBySlugOrId(id)
      if (cancelled) return
      if (!data) {
        setCls(null)
        return
      }
      setCls(data as ClassDetails)
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (cls === undefined) return
    if (!user?.id || !cls) {
      setAccessRow(null)
      setChecked(true)
      return
    }
    let cancelled = false
    ;(async () => {
      const row = await fetchUserAccessForClass(user.id, cls.id)
      if (cancelled) return
      setAccessRow(row)
      setChecked(true)
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id, cls])

  useEffect(() => {
    if (!showWaitingRoom && !recordingProcessing || !id) return
    const poll = window.setInterval(() => void refreshClass(), 15_000)
    return () => window.clearInterval(poll)
  }, [showWaitingRoom, recordingProcessing, id, refreshClass])

  useEffect(() => {
    if (theatreMode) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [theatreMode])

  const measureBuffer = useCallback(() => {
    const video = playerShellRef.current?.querySelector('video') ?? null
    setConnection(bufferQuality(video))
  }, [])

  useEffect(() => {
    if (showWaitingRoom || recordingProcessing) return
    const intervalId = window.setInterval(measureBuffer, 2000)
    return () => window.clearInterval(intervalId)
  }, [showWaitingRoom, recordingProcessing, measureBuffer])

  if (!id) return <Navigate to="/" replace />

  if (authLoading || cls === undefined || !checked) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-[var(--text-muted)]">
        Preparing live room…
      </div>
    )
  }

  if (cls === null) {
    return (
      <div className="space-y-2">
        <p className="text-[var(--text-muted)]">Class not found.</p>
        <Link to="/" className="text-[var(--accent)] hover:underline">
          Back home
        </Link>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `/class/${id}/live` }} />
  }

  if (isGuidedMeditation(cls)) {
    return <Navigate to={sanctuaryDetailPath(cls)} replace />
  }

  if (!hasAccess(accessRow)) {
    return <Navigate to={classDetailPath(cls)} replace />
  }

  const start = new Date(cls.scheduled_at).getTime()
  if (Date.now() < start && !isFinished) {
    return <Navigate to={classDetailPath(cls)} replace />
  }

  const roomLabel = isVod ? 'Replay' : 'Live room'
  const statusLine = isVod
    ? 'Watch the session recording'
    : showWaitingRoom
      ? 'Stream offline — waiting for the instructor'
      : 'You are in the session'

  const playerBlock = (
    <NeonCardGlow className="w-full">
      <div
        ref={playerShellRef}
        className={cn(
          'relative overflow-hidden rounded-2xl bg-black',
          theatreMode ? 'aspect-auto min-h-[calc(100vh-8rem)]' : 'aspect-video w-full',
        )}
      >
        {recordingProcessing ? (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-black/90 p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
            <p className="text-sm font-medium text-white/90">Preparing your replay…</p>
            <p className="max-w-sm text-xs text-white/60">
              The recording is being processed. This page refreshes automatically.
            </p>
          </div>
        ) : showWaitingRoom ? (
          <LiveWaitingRoom
            scheduledAt={cls.scheduled_at}
            coverImageUrl={cls.image_url}
          />
        ) : playbackId ? (
          <>
            <MuxPlayer
              playbackId={playbackId}
              streamType={isVod ? 'on-demand' : 'live'}
              autoPlay={!isVod}
              muted={false}
              className="h-full w-full [--controls:none] sm:[--controls:minimal]"
              style={{
                aspectRatio: theatreMode ? undefined : '16/9',
                width: '100%',
                height: '100%',
              }}
              onPlaying={() => {
                setPlayerPlaying(true)
                setConnection('good')
              }}
              onWaiting={() => setConnection('poor')}
              onStalled={() => setConnection('fair')}
              onCanPlay={() => {
                measureBuffer()
                setConnection('good')
              }}
              onProgress={measureBuffer}
              onError={() => setConnection('poor')}
            />

            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
              <div className="pointer-events-auto flex flex-wrap items-center gap-2">
                {isVod ? (
                  <div className={cn(badgeOnImageWarm, 'rounded-full px-2.5 py-1 normal-case')}>
                    REPLAY
                  </div>
                ) : (
                  <>
                    <div className={cn(badgeOnImageLight, 'rounded-full px-2.5 py-1 normal-case')}>
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                      </span>
                      LIVE
                    </div>
                    <div className={cn(badgeOnImageDark, 'rounded-full px-2.5 py-1 normal-case font-medium')}>
                      {viewerCount} watching
                    </div>
                  </>
                )}
              </div>
              <div className="pointer-events-auto flex items-center gap-2">
                <ConnectionSignal quality={connection} />
                <button
                  type="button"
                  onClick={() => setTheatreMode((t) => !t)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-900 text-white shadow-sm transition hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                  aria-label={theatreMode ? 'Exit theatre mode' : 'Theatre mode'}
                >
                  {theatreMode ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {!isVod && <LiveReactionBurst />}
          </>
        ) : cls.video_url ? (
          <video
            src={cls.video_url}
            className="h-full w-full object-contain"
            controls
            playsInline
            onPlaying={() => setPlayerPlaying(true)}
          />
        ) : (
          <LiveWaitingRoom
            scheduledAt={cls.scheduled_at}
            coverImageUrl={cls.image_url}
          />
        )}
      </div>
    </NeonCardGlow>
  )

  return (
    <div
      className={cn(
        'transition-colors duration-300',
        theatreMode && 'fixed inset-0 z-50 flex flex-col bg-black/95 px-3 py-4 sm:px-6',
      )}
    >
      {theatreMode && (
        <div
          className="pointer-events-none fixed inset-0 bg-black/90"
          aria-hidden
        />
      )}

      <div className={cn('relative z-10', theatreMode ? 'mx-auto w-full max-w-[1600px]' : 'space-y-6')}>
        {!theatreMode && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                {roomLabel}
              </p>
              <h1 className="text-2xl font-semibold text-[var(--text)]">{cls.title}</h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{statusLine}</p>
            </div>
            <Link
              to={classDetailPath(cls)}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--accent)]"
            >
              Class details
            </Link>
          </div>
        )}

        {theatreMode && (
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-white/90">{cls.title}</p>
            <Link
              to={classDetailPath(cls)}
              className="shrink-0 text-xs text-[var(--accent)] hover:underline"
            >
              Exit
            </Link>
          </div>
        )}

        <motion.div layout>{playerBlock}</motion.div>

        {!theatreMode && !isVod && (
          <p className="text-center text-xs text-[var(--text-muted)]">
            Tip: use theatre mode for a distraction-free view. Send love with the heart button.
          </p>
        )}
        {!theatreMode && isVod && (
          <p className="text-center text-xs text-[var(--text-muted)]">
            Tip: use theatre mode for a distraction-free replay.
          </p>
        )}
      </div>
    </div>
  )
}
