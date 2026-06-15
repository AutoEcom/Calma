import Hls from 'hls.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchSignedAudioUrl,
  SIGNED_URL_EXPIRY_SEC,
  type AudioStreamVariant,
} from '../lib/audioSignedUrl'
import { isMuxStreamUrl, MUX_SANCTUARY_HLS_CONFIG } from '../lib/muxStreamPlayback'

function refreshDelayMs(expiresIn: number): number {
  return Math.max(20_000, (expiresIn - 20) * 1000)
}

function isNativeHls(): boolean {
  const probe = document.createElement('video')
  return probe.canPlayType('application/vnd.apple.mpegurl') !== ''
}

type Options = {
  classId: string | null
  variant: AudioStreamVariant
  enabled: boolean
  onPlayStart?: () => void
  onStreamEnded?: () => void
}

export function useSanctuaryStream({
  classId,
  variant,
  enabled,
  onPlayStart,
  onStreamEnded,
}: Options) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const refreshTimerRef = useRef<number | null>(null)
  const resolveGenerationRef = useRef(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
  }, [])

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  const attachHls = useCallback(
    async (
      url: string,
      options: { isRefresh: boolean; isMux: boolean; expiresIn: number; generation: number },
    ) => {
      const audio = audioRef.current
      if (!audio || options.generation !== resolveGenerationRef.current) return

      if (!options.isRefresh) {
        destroyHls()
      }

      const savedTime = options.isRefresh ? audio.currentTime : 0
      const wasPlaying = options.isRefresh && !audio.paused

      audio.controls = false
      audio.preload = 'auto'
      audio.crossOrigin = 'anonymous'
      audio.disableRemotePlayback = false

      if (isNativeHls()) {
        audio.src = url
      } else if (Hls.isSupported()) {
        if (!hlsRef.current) {
          const hls = new Hls({
            ...MUX_SANCTUARY_HLS_CONFIG,
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

      if (options.isRefresh && savedTime > 0) {
        audio.currentTime = savedTime
        if (wasPlaying) {
          await audio.play().catch(() => undefined)
        }
      }

      clearRefreshTimer()
      if (!options.isMux) {
        refreshTimerRef.current = window.setTimeout(() => {
          void resolveAndAttach(true, resolveGenerationRef.current)
        }, refreshDelayMs(options.expiresIn))
      }
    },
    [clearRefreshTimer, destroyHls],
  )

  const resolveAndAttach = useCallback(
    async (isRefresh = false, generation = resolveGenerationRef.current) => {
      if (!enabled || !classId || generation !== resolveGenerationRef.current) return

      if (!isRefresh) {
        setLoading(true)
      }
      setError(false)

      try {
        const result = await fetchSignedAudioUrl(classId, variant)
        if (generation !== resolveGenerationRef.current) return

        const url = result.url.trim()
        const isMux = result.source === 'mux' || isMuxStreamUrl(url)

        await attachHls(url, {
          isRefresh,
          isMux,
          expiresIn: result.expiresIn ?? SIGNED_URL_EXPIRY_SEC,
          generation,
        })
      } catch {
        if (generation === resolveGenerationRef.current) {
          setError(true)
        }
      } finally {
        if (generation === resolveGenerationRef.current) {
          setLoading(false)
        }
      }
    },
    [attachHls, classId, enabled, variant],
  )

  useEffect(() => {
    if (!enabled || !classId) {
      resolveGenerationRef.current += 1
      clearRefreshTimer()
      return
    }

    const generation = ++resolveGenerationRef.current
    void resolveAndAttach(false, generation)

    return () => {
      resolveGenerationRef.current += 1
      clearRefreshTimer()
      destroyHls()
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
      }
    }
  }, [enabled, classId, variant, resolveAndAttach, clearRefreshTimer, destroyHls])

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
      onStreamEnded?.()
    }
    const onLoadStart = () => setLoading(true)
    const onCanPlay = () => {
      setLoading(false)
      setError(false)
    }
    const onWaiting = () => setLoading(true)
    const onMediaError = () => {
      setLoading(false)
      setError(true)
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('durationchange', onMeta)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnd)
    audio.addEventListener('loadstart', onLoadStart)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('error', onMediaError)

    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('durationchange', onMeta)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnd)
      audio.removeEventListener('loadstart', onLoadStart)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('error', onMediaError)
    }
  }, [onPlayStart, onStreamEnded])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      try {
        await audio.play()
      } catch {
        setError(true)
      }
    } else {
      audio.pause()
    }
  }, [])

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
