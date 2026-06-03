import { motion } from 'framer-motion'
import {
  Loader2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { detectSpatialAudioSupport } from '../../lib/audioSpatial'
import { useSecureHlsAudio } from '../../hooks/useSecureHlsAudio'
import { recordAudioListenComplete, recordAudioPlayStart } from '../../lib/recordAudioListen'
import { parseAudioCredits } from '../../lib/audioSanctuary'
import { sanctuaryCoverUrl } from '../../lib/sanctuaryCover'
import type { ClassDetails } from '../../lib/classTypes'
import { PlayerBreathVisualizer } from './PlayerBreathVisualizer'
import { cn } from '../../lib/utils'

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

type Props = {
  meditation: ClassDetails
}

export function AudioSanctuaryPlayer({ meditation }: Props) {
  const [spatial, setSpatial] = useState(false)
  const [spatialChecked, setSpatialChecked] = useState(false)
  const [volume, setVolume] = useState(0.85)
  const cover = sanctuaryCoverUrl(meditation)

  const canPlay = meditation.sanctuary_status === 'active'

  const credits = parseAudioCredits(meditation.audio_credits)
  const guide = credits.guide ?? meditation.instructor_name

  const onPlayStarted = useCallback(() => {
    void recordAudioPlayStart(meditation.id)
  }, [meditation.id])

  const onListenComplete = useCallback(() => {
    void recordAudioListenComplete(
      meditation.id,
      Math.floor(meditation.duration_minutes * 60),
    )
  }, [meditation.id, meditation.duration_minutes])

  const streamVariant = spatial ? 'atmos' : 'stereo'
  const spatialBadge = spatial ? 'Dolby Atmos Active' : 'Studio Master Stereo'

  const {
    audioRef,
    loading: streamLoading,
    error: streamError,
    playing,
    currentTime,
    duration,
    togglePlay,
    seek,
    seekBySeconds,
    setVolume: setAudioVolume,
  } = useSecureHlsAudio({
    classId: canPlay ? meditation.id : null,
    variant: streamVariant,
    enabled: canPlay,
    onPlayStart: onPlayStarted,
    onEnded: onListenComplete,
  })

  useEffect(() => {
    setAudioVolume(volume)
  }, [volume, setAudioVolume, canPlay])

  useEffect(() => {
    let cancelled = false
    void detectSpatialAudioSupport().then((ok) => {
      if (!cancelled) {
        setSpatial(ok)
        setSpatialChecked(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!playing || !meditation) return
    const artwork = cover ?? ''
    if ('mediaSession' in navigator && artwork) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: meditation.title,
        artist: `Guided by ${guide}`,
        album: 'Calma Audio Sanctuary',
        artwork: [{ src: artwork, sizes: '512x512', type: 'image/jpeg' }],
      })
      navigator.mediaSession.setActionHandler('play', () => void togglePlay())
      navigator.mediaSession.setActionHandler('pause', () => void togglePlay())
      navigator.mediaSession.setActionHandler('seekbackward', () => seekBySeconds(-15))
      navigator.mediaSession.setActionHandler('seekforward', () => seekBySeconds(15))
    }
    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null
        navigator.mediaSession.setActionHandler('play', null)
        navigator.mediaSession.setActionHandler('pause', null)
        navigator.mediaSession.setActionHandler('seekbackward', null)
        navigator.mediaSession.setActionHandler('seekforward', null)
      }
    }
  }, [playing, meditation, guide, cover, togglePlay, seekBySeconds])

  const progress = duration > 0 ? currentTime / duration : 0

  if (meditation.sanctuary_status === 'coming_soon') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 rounded-3xl bg-black text-center">
        <PlayerBreathVisualizer playing={false} size={160} />
        <h1 className="text-xl font-light tracking-wide text-white">{meditation.title}</h1>
        <p className="text-sm text-white/50">Coming soon to the Audio Sanctuary.</p>
        <Link to="/sanctuary" className="text-sm text-[var(--accent)] hover:underline">
          ← Back to Sanctuary
        </Link>
      </div>
    )
  }

  return (
    <div className="calma-premium-dark fixed inset-0 z-50 flex flex-col overflow-hidden bg-black">
      <audio ref={audioRef} className="sr-only" playsInline />

      {cover && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{
            opacity: playing ? [0.35, 0.5, 0.35] : [0.25, 0.32, 0.25],
            scale: playing ? [1.05, 1.12, 1.05] : [1.02, 1.06, 1.02],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src={cover}
            alt=""
            className="h-full w-full scale-110 object-cover opacity-40 blur-[80px]"
          />
        </motion.div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="px-5 pt-5">
          <Link
            to="/sanctuary"
            className="text-xs font-medium tracking-[0.14em] text-white/45 transition hover:text-white"
          >
            ← Sanctuary
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-8 pt-4">
          <PlayerBreathVisualizer playing={playing && !streamLoading} size={220} />

          <div className="mt-10 max-w-md text-center">
            <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
              {meditation.title}
            </h1>
            <p className="mt-2 text-sm text-white/50">Guided by {guide}</p>
            {credits.frequency && (
              <p className="mt-3 text-xs font-medium tracking-[0.18em] text-[#2DD4BF]">
                {credits.frequency}
              </p>
            )}
            {spatialChecked && (
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#2DD4BF]/70">
                {spatialBadge}
              </p>
            )}
          </div>

          <div
            className={cn(
              'mt-10 w-full max-w-md rounded-3xl border border-white/10 p-5',
              'bg-white/[0.06] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.8)] backdrop-blur-2xl',
            )}
          >
            {(streamLoading || streamError) && (
              <p className="mb-3 text-center text-xs text-white/45">
                {streamLoading ? 'Securing stream…' : streamError}
              </p>
            )}

            <div
              className="mb-2 h-1 w-full cursor-pointer overflow-hidden rounded-full bg-white/10"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                seek((e.clientX - rect.left) / rect.width)
              }}
              role="slider"
              aria-valuenow={Math.round(progress * 100)}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2DD4BF] to-[#5eead4]"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="mb-5 flex justify-between text-[11px] tabular-nums text-white/40">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => seekBySeconds(-15)}
                className="flex flex-col items-center gap-1 text-white/55 transition hover:text-[#2DD4BF]"
                aria-label="Rewind 15 seconds"
              >
                <RotateCcw className="h-6 w-6" />
                <span className="text-[9px] font-medium tracking-wider">15s</span>
              </button>

              <button
                type="button"
                onClick={() => void togglePlay()}
                disabled={streamLoading}
                className={cn(
                  'relative flex h-[72px] w-[72px] items-center justify-center rounded-full',
                  'border-2 border-[#2DD4BF] bg-[#2DD4BF]/10 text-[#2DD4BF]',
                  'shadow-[0_0_40px_rgba(45,212,191,0.45)] transition hover:scale-105 disabled:opacity-50',
                )}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {streamLoading ? (
                  <Loader2 className="h-7 w-7 animate-spin" />
                ) : playing ? (
                  <Pause className="h-7 w-7" />
                ) : (
                  <Play className="h-7 w-7 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={() => seekBySeconds(15)}
                className="flex flex-col items-center gap-1 text-white/55 transition hover:text-[#2DD4BF]"
                aria-label="Forward 15 seconds"
              >
                <RotateCw className="h-6 w-6" />
                <span className="text-[9px] font-medium tracking-wider">15s</span>
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
              {volume === 0 ? (
                <VolumeX className="h-4 w-4 shrink-0 text-white/40" />
              ) : (
                <Volume2 className="h-4 w-4 shrink-0 text-[#2DD4BF]/80" />
              )}
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/15 accent-[#2DD4BF]"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
