import type MuxPlayerElement from '@mux/mux-player'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchSignedAudioUrl,
  SIGNED_URL_EXPIRY_SEC,
  type AudioStreamVariant,
} from '../lib/audioSignedUrl'
import { isMuxStreamUrl, parseMuxPlaybackId } from '../lib/muxStreamPlayback'

function refreshDelayMs(expiresIn: number): number {
  return Math.max(20_000, (expiresIn - 20) * 1000)
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
  const playerRef = useRef<MuxPlayerElement | null>(null)
  const refreshTimerRef = useRef<number | null>(null)

  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [playbackId, setPlaybackId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const getMedia = useCallback((): HTMLMediaElement | null => {
    const el = playerRef.current
    if (!el) return null
    const native = (el as MuxPlayerElement & { media?: HTMLMediaElement }).media
    return native ?? (el as unknown as HTMLMediaElement)
  }, [])

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  const resolveStream = useCallback(
    async (id: string, streamVariant: AudioStreamVariant, isRefresh = false) => {
      if (!enabled) return

      setLoading(true)
      setError(false)

      const media = getMedia()
      const savedTime = isRefresh && media ? media.currentTime : 0
      const wasPlaying = isRefresh && media ? !media.paused : false

      try {
        const result = await fetchSignedAudioUrl(id, streamVariant)
        const url = result.url
        const muxSource =
          result.source === 'mux' || isMuxStreamUrl(url) ? 'mux' : 'storage'

        const idFromUrl = parseMuxPlaybackId(url)
        setPlaybackId(idFromUrl)
        setStreamUrl(idFromUrl ? null : url)

        if (isRefresh && media && savedTime > 0) {
          media.currentTime = savedTime
          if (wasPlaying) {
            await media.play().catch(() => undefined)
          }
        }

        clearRefreshTimer()
        if (muxSource === 'storage') {
          refreshTimerRef.current = window.setTimeout(() => {
            void resolveStream(id, streamVariant, true)
          }, refreshDelayMs(result.expiresIn ?? SIGNED_URL_EXPIRY_SEC))
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    },
    [clearRefreshTimer, enabled, getMedia],
  )

  useEffect(() => {
    if (!enabled || !classId) {
      setStreamUrl(null)
      setPlaybackId(null)
      return
    }

    void resolveStream(classId, variant)

    return () => {
      clearRefreshTimer()
      const media = getMedia()
      media?.pause()
      setStreamUrl(null)
      setPlaybackId(null)
    }
  }, [enabled, classId, variant, resolveStream, clearRefreshTimer, getMedia])

  const onPlay = useCallback(() => {
    setPlaying(true)
    onPlayStart?.()
  }, [onPlayStart])

  const onPause = useCallback(() => {
    setPlaying(false)
  }, [])

  const onTimeUpdate = useCallback(() => {
    const media = getMedia()
    if (media) setCurrentTime(media.currentTime)
  }, [getMedia])

  const onDurationChange = useCallback(() => {
    const media = getMedia()
    if (media) setDuration(media.duration || 0)
  }, [getMedia])

  const onEnded = useCallback(() => {
    setPlaying(false)
    onStreamEnded?.()
  }, [onStreamEnded])

  const onLoadStart = useCallback(() => {
    setLoading(true)
  }, [])

  const onCanPlay = useCallback(() => {
    setLoading(false)
    setError(false)
  }, [])

  const onWaiting = useCallback(() => {
    setLoading(true)
  }, [])

  const onStreamError = useCallback(() => {
    setLoading(false)
    setError(true)
  }, [])

  const togglePlay = useCallback(async () => {
    const media = getMedia()
    if (!media || loading) return
    if (media.paused) {
      try {
        await media.play()
      } catch {
        setError(true)
      }
    } else {
      media.pause()
    }
  }, [getMedia, loading])

  const seek = useCallback(
    (ratio: number) => {
      const media = getMedia()
      if (!media || !Number.isFinite(media.duration)) return
      media.currentTime = Math.max(0, Math.min(1, ratio)) * media.duration
    },
    [getMedia],
  )

  const seekBySeconds = useCallback(
    (delta: number) => {
      const media = getMedia()
      if (!media || !Number.isFinite(media.duration)) return
      media.currentTime = Math.max(0, Math.min(media.duration, media.currentTime + delta))
    },
    [getMedia],
  )

  const setVolume = useCallback(
    (level: number) => {
      const media = getMedia()
      if (!media) return
      media.volume = Math.max(0, Math.min(1, level))
    },
    [getMedia],
  )

  return {
    playerRef,
    streamUrl,
    playbackId,
    loading,
    error,
    playing,
    currentTime,
    duration,
    togglePlay,
    seek,
    seekBySeconds,
    setVolume,
    streamHandlers: {
      onPlay,
      onPause,
      onTimeUpdate,
      onDurationChange,
      onEnded,
      onLoadStart,
      onCanPlay,
      onWaiting,
      onError: onStreamError,
    },
  }
}
