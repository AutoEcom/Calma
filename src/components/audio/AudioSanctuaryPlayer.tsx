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
import { useMediaSession } from '../../hooks/useMediaSession'
import { useSanctuaryStream } from '../../hooks/useSanctuaryStream'
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

  /** Wait for spatial probe before picking variant — avoids stereo→atmos remount flash. */
  const streamVariant = spatialChecked && spatial ? 'atmos' : 'stereo'
  const isAtmosActive = spatialChecked && spatial
  const studioInput = (credits.studio_input ?? credits.studio ?? '').trim()
  const studioMasterLine = studioInput
    ? `STUDIO MASTER: ${studioInput} | 24-BIT 96kHz`
    : 'STUDIO MASTER | 24-BIT 96kHz'

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
  } = useSanctuaryStream({
    classId: canPlay ? meditation.id : null,
    variant: streamVariant,
    enabled: canPlay && spatialChecked,
    onPlayStart: onPlayStarted,
    onStreamEnded: onListenComplete,
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

  useMediaSession(
    canPlay
      ? {
          title: meditation.title,
          artist: `Guided by ${guide}`,
          album: 'Calma Sanctuary',
          artworkUrl: cover,
        }
      : null,
    {
      playing,
      currentTime,
      duration,
      onTogglePlay: () => void togglePlay(),
      onSeekBySeconds: seekBySeconds,
    },
  )

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
    <div className="calma-premium-dark fixed inset-0 z-50 flex h-dvh flex-col bg-black">
      <audio
        ref={audioRef}
        className="sr-only"
        preload="auto"
        playsInline
        crossOrigin="anonymous"
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {cover && (
          <motion.div
            className="absolute inset-0"
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
          <Link
            to="/sanctuary"
            className="text-xs font-medium tracking-[0.14em] text-white/45 transition hover:text-white"
          >
            ← Sanctuary
          </Link>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="mx-auto flex w-full max-w-md flex-col items-center overflow-visible px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
            <div className="relative z-10 flex w-full justify-center overflow-visible py-4">
              <PlayerBreathVisualizer playing={playing && !streamLoading} size={220} />
            </div>

            <div className="relative z-20 mt-6 w-full text-center">
            <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
              {meditation.title}
            </h1>
            <p className="mt-2 text-sm text-white/50">Guided by {guide}</p>
            {credits.frequency && (
              <p className="mt-3 text-xs font-medium tracking-[0.18em] text-[#2DD4BF]">
                {credits.frequency}
              </p>
            )}

            {spatialChecked && isAtmosActive ? (
              <motion.p
                key="atmos"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="sanctuary-atmos-glow mt-4 text-[11px] font-bold uppercase tracking-[0.38em] text-[#a7f3d0]"
              >
                Dolby Atmos
              </motion.p>
            ) : spatialChecked ? (
              <motion.p
                key="stereo"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35"
              >
                Studio Master Stereo
              </motion.p>
            ) : null}

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">
              {studioMasterLine}
            </p>
            </div>

            <div className="mt-5 w-full space-y-2 px-1">
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={Number.isFinite(progress) ? progress : 0}
                onChange={(e) => seek(Number(e.target.value))}
                className="sanctuary-timeline-slider"
                style={{ ['--sanctuary-progress' as string]: `${progress * 100}%` }}
                aria-label="Track progress"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
              <div className="flex justify-between text-[11px] tabular-nums text-white/40">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div
              className={cn(
                'mt-4 w-full rounded-3xl border border-white/10 p-5',
                'bg-white/[0.06] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.8)] backdrop-blur-2xl',
              )}
            >
              {(streamLoading || streamError) && (
                <p className="mb-4 text-center text-xs text-white/45" role="status">
                  {streamLoading
                    ? 'Preparing your stream…'
                    : 'Playback paused — tap play to continue.'}
                </p>
              )}

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
                  className={cn(
                    'relative flex h-[72px] w-[72px] items-center justify-center rounded-full',
                    'border-2 border-[#2DD4BF] bg-[#2DD4BF]/10 text-[#2DD4BF]',
                    'shadow-[0_0_40px_rgba(45,212,191,0.45)] transition hover:scale-105',
                    streamLoading && !playing && 'opacity-80',
                  )}
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  {streamLoading && !playing ? (
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

              <div className="mt-5 flex items-center gap-3 border-t border-white/8 pt-4">
                {volume === 0 ? (
                  <VolumeX className="h-3.5 w-3.5 shrink-0 text-white/30" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 shrink-0 text-[#2DD4BF]/55" />
                )}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="sanctuary-volume-slider flex-1"
                  aria-label="Volume"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
