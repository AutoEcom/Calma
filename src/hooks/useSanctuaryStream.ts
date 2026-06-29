import Hls from 'hls.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { isAtmosEc3PlaybackSupported } from '../lib/audioSpatial'
import { resolveAtmosStreamUrl } from '../lib/atmosSourceUrl'
import {
  fetchSignedAudioUrl,
  SIGNED_URL_EXPIRY_SEC,
  type AudioStreamVariant,
} from '../lib/audioSignedUrl'
import { isMuxStreamUrl, MUX_SANCTUARY_HLS_CONFIG } from '../lib/muxStreamPlayback'

const ATMOS_STALL_MS = 12_000

function refreshDelayMs(expiresIn: number): number {
  return Math.max(20_000, (expiresIn - 20) * 1000)
}

function isNativeHls(): boolean {
  const probe = document.createElement('video')
  return probe.canPlayType('application/vnd.apple.mpegurl') !== ''
}

function resolveEffectiveVariant(
  requested: AudioStreamVariant,
  stereoFallback: boolean,
): AudioStreamVariant {
  if (requested !== 'atmos') return requested
  if (stereoFallback || !isAtmosEc3PlaybackSupported()) return 'stereo'
  return 'atmos'
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
  const atmosStallTimerRef = useRef<number | null>(null)
  const resolveGenerationRef = useRef(0)
  const stereoFallbackRef = useRef(false)
  const directAtmosActiveRef = useRef(false)
  const resolveAndAttachRef = useRef<
    (isRefresh?: boolean, generation?: number, overrideVariant?: AudioStreamVariant) => Promise<void>
  >(async () => {})

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

  const clearAtmosStallWatch = useCallback(() => {
    if (atmosStallTimerRef.current) {
      window.clearTimeout(atmosStallTimerRef.current)
      atmosStallTimerRef.current = null
    }
  }, [])

  const attachDirect = useCallback(
    async (
      url: string,
      options: { isRefresh: boolean; generation: number },
    ) => {
      const audio = audioRef.current
      if (!audio || options.generation !== resolveGenerationRef.current) return

      destroyHls()
      clearRefreshTimer()

      const savedTime = options.isRefresh ? audio.currentTime : 0
      const wasPlaying = options.isRefresh && !audio.paused

      audio.controls = false
      audio.preload = 'auto'
      audio.crossOrigin = 'anonymous'
      audio.disableRemotePlayback = false
      audio.src = url

      if (options.isRefresh && savedTime > 0) {
        audio.currentTime = savedTime
        if (wasPlaying) {
          await audio.play().catch(() => undefined)
        }
      }
    },
    [clearRefreshTimer, destroyHls],
  )

  const attachHls = useCallback(
    async (
      url: string,
      options: { isRefresh: boolean; isMux: boolean; expiresIn: number; generation: number },
    ) => {
      const audio = audioRef.current
      if (!audio || options.generation !== resolveGenerationRef.current) return

      directAtmosActiveRef.current = false
      clearAtmosStallWatch()

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
          void resolveAndAttachRef.current(true, resolveGenerationRef.current)
        }, refreshDelayMs(options.expiresIn))
      }
    },
    [clearAtmosStallWatch, clearRefreshTimer, destroyHls],
  )

  const triggerStereoFallback = useCallback((generation: number) => {
    if (stereoFallbackRef.current || variant !== 'atmos') return
    stereoFallbackRef.current = true
    directAtmosActiveRef.current = false
    clearAtmosStallWatch()
    void resolveAndAttachRef.current(false, generation, 'stereo')
  }, [clearAtmosStallWatch, variant])

  const startAtmosStallWatch = useCallback(
    (generation: number) => {
      clearAtmosStallWatch()
      atmosStallTimerRef.current = window.setTimeout(() => {
        const audio = audioRef.current
        if (
          generation !== resolveGenerationRef.current ||
          !directAtmosActiveRef.current ||
          !audio
        ) {
          return
        }
        const stalled =
          audio.readyState < HTMLMediaElement.HAVE_CURRENT_DATA &&
          audio.currentTime === 0 &&
          (audio.networkState === HTMLMediaElement.NETWORK_LOADING ||
            audio.networkState === HTMLMediaElement.NETWORK_IDLE)
        if (stalled) {
          triggerStereoFallback(generation)
        }
      }, ATMOS_STALL_MS)
    },
    [clearAtmosStallWatch, triggerStereoFallback],
  )

  const resolveAndAttach = useCallback(
    async (
      isRefresh = false,
      generation = resolveGenerationRef.current,
      overrideVariant?: AudioStreamVariant,
    ) => {
      if (!enabled || !classId || generation !== resolveGenerationRef.current) return

      if (!isRefresh) {
        setLoading(true)
      }
      setError(false)

      try {
        const requested = overrideVariant ?? variant
        const effective = resolveEffectiveVariant(requested, stereoFallbackRef.current)
        const result = await fetchSignedAudioUrl(classId, effective)
        if (generation !== resolveGenerationRef.current) return

        const url = result.url.trim()
        const isDirectAtmos = effective === 'atmos' && result.source === 'direct'

        if (isDirectAtmos) {
          directAtmosActiveRef.current = true
          const streamUrl = resolveAtmosStreamUrl(url)
          await attachDirect(streamUrl, { isRefresh, generation })
          startAtmosStallWatch(generation)
          return
        }

        await attachHls(url, {
          isRefresh,
          isMux: result.source === 'mux' || isMuxStreamUrl(url),
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
    [attachDirect, attachHls, classId, enabled, startAtmosStallWatch, variant],
  )

  resolveAndAttachRef.current = resolveAndAttach

  useEffect(() => {
    stereoFallbackRef.current = false
    directAtmosActiveRef.current = false
  }, [classId])

  useEffect(() => {
    if (!enabled || !classId) {
      resolveGenerationRef.current += 1
      clearRefreshTimer()
      clearAtmosStallWatch()
      return
    }

    const generation = ++resolveGenerationRef.current
    void resolveAndAttach(false, generation)

    return () => {
      resolveGenerationRef.current += 1
      clearRefreshTimer()
      clearAtmosStallWatch()
      destroyHls()
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
      }
    }
  }, [
    enabled,
    classId,
    variant,
    resolveAndAttach,
    clearRefreshTimer,
    clearAtmosStallWatch,
    destroyHls,
  ])

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
      clearAtmosStallWatch()
      setLoading(false)
      setError(false)
    }
    const onWaiting = () => setLoading(true)
    const onMediaError = () => {
      const code = audio.error?.code
      if (
        directAtmosActiveRef.current &&
        variant === 'atmos' &&
        (code === MediaError.MEDIA_ERR_DECODE || code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED)
      ) {
        triggerStereoFallback(resolveGenerationRef.current)
        return
      }
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
  }, [clearAtmosStallWatch, onPlayStart, onStreamEnded, triggerStereoFallback, variant])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      try {
        await audio.play()
      } catch {
        if (directAtmosActiveRef.current && variant === 'atmos') {
          triggerStereoFallback(resolveGenerationRef.current)
          return
        }
        setError(true)
      }
    } else {
      audio.pause()
    }
  }, [triggerStereoFallback, variant])

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
