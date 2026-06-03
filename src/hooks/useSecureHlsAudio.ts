import Hls from 'hls.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchSignedAudioUrl,
  SIGNED_URL_EXPIRY_SEC,
  type AudioStreamVariant,
} from '../lib/audioSignedUrl'

function isNativeHls(): boolean {
  const v = document.createElement('video')
  return v.canPlayType('application/vnd.apple.mpegurl') !== ''
}

/** Refresh before Supabase signed URL expires (60s). */
function refreshDelayMs(expiresIn: number): number {
  return Math.max(15_000, (expiresIn - 15) * 1000)
}

type Options = {
  classId: string | null
  variant: AudioStreamVariant
  enabled: boolean
  /** Fires when the browser `play` event runs (audio actually started). */
  onPlayStart?: () => void
  onEnded?: () => void
}

export function useSecureHlsAudio({ classId, variant, enabled, onPlayStart, onEnded }: Options) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const refreshTimerRef = useRef<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
  }, [])

  const resolveSignedUrl = useCallback(async (id: string, streamVariant: AudioStreamVariant) => {
    const result = await fetchSignedAudioUrl(id, streamVariant)
    return result.url
  }, [])

  const attachStream = useCallback(
    async (id: string, streamVariant: AudioStreamVariant, isRefresh = false) => {
      const audio = audioRef.current
      if (!audio) return

      setLoading(true)
      setError(null)

      if (!isRefresh) {
        destroyHls()
      }

      const savedTime = isRefresh ? audio.currentTime : 0
      const wasPlaying = isRefresh && !audio.paused

      try {
        // Always sign via edge (service role); private bucket blocks client-side refresh.
        const url = await resolveSignedUrl(id, streamVariant)

        audio.controls = false
        audio.setAttribute('controlsList', 'nodownload noplaybackrate')
        audio.disableRemotePlayback = true
        audio.preload = 'auto'
        audio.crossOrigin = 'anonymous'

        if (isNativeHls()) {
          audio.src = url
        } else if (Hls.isSupported()) {
          if (!hlsRef.current) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false,
              xhrSetup: (xhr) => {
                xhr.withCredentials = false
              },
            })
            hlsRef.current = hls
            hls.attachMedia(audio)
          }
          hlsRef.current.loadSource(url)
        } else {
          throw new Error('HLS is not supported in this browser')
        }

        if (isRefresh && savedTime > 0) {
          audio.currentTime = savedTime
          if (wasPlaying) {
            await audio.play().catch(() => undefined)
          }
        }

        if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current)
        refreshTimerRef.current = window.setTimeout(() => {
          void attachStream(id, streamVariant, true)
        }, refreshDelayMs(SIGNED_URL_EXPIRY_SEC))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Playback failed')
      } finally {
        setLoading(false)
      }
    },
    [destroyHls, resolveSignedUrl],
  )

  useEffect(() => {
    if (!enabled || !classId) return
    void attachStream(classId, variant)
    return () => {
      destroyHls()
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current)
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
      }
    }
  }, [enabled, classId, variant, attachStream, destroyHls])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => setCurrentTime(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 0)
    const onPlay = () => {
      setPlaying(true)
      onPlayStart?.()
    }
    const onPause = () => setPlaying(false)
    const onEnd = () => {
      setPlaying(false)
      onEnded?.()
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('durationchange', onMeta)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnd)

    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('durationchange', onMeta)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnd)
    }
  }, [onPlayStart, onEnded])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || loading) return
    if (audio.paused) {
      try {
        await audio.play()
      } catch {
        setError('Tap play to start audio')
      }
    } else {
      audio.pause()
    }
  }, [loading])

  const seek = useCallback((ratio: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) return
    audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration
  }, [])

  const seekBySeconds = useCallback((delta: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) return
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + delta))
  }, [])

  const setVolume = useCallback((level: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = Math.max(0, Math.min(1, level))
  }, [])

  return {
    audioRef,
    loading,
    error,
    playing,
    currentTime,
    duration,
    togglePlay,
    seek,
    seekBySeconds,
    setVolume,
  }
}
