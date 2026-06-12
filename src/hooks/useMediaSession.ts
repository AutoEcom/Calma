import { useEffect, useRef } from 'react'

type MediaSessionTrack = {
  title: string
  artist: string
  album?: string
  artworkUrl?: string | null
}

type MediaSessionControls = {
  playing: boolean
  currentTime: number
  duration: number
  onTogglePlay: () => void
  onSeekBySeconds: (delta: number) => void
}

const ALBUM_NAME = 'Calma Sanctuary'

export function useMediaSession(
  track: MediaSessionTrack | null,
  controls: MediaSessionControls,
) {
  const controlsRef = useRef(controls)
  controlsRef.current = controls

  useEffect(() => {
    if (!track || !('mediaSession' in navigator)) return

    const artwork = track.artworkUrl?.trim()
    const metadata: MediaMetadataInit = {
      title: track.title,
      artist: track.artist,
      album: track.album ?? ALBUM_NAME,
    }

    if (artwork) {
      metadata.artwork = [
        { src: artwork, sizes: '512x512', type: 'image/jpeg' },
        { src: artwork, sizes: '256x256', type: 'image/jpeg' },
      ]
    }

    navigator.mediaSession.metadata = new MediaMetadata(metadata)

    navigator.mediaSession.setActionHandler('play', () => {
      controlsRef.current.onTogglePlay()
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      controlsRef.current.onTogglePlay()
    })
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      controlsRef.current.onSeekBySeconds(-15)
    })
    navigator.mediaSession.setActionHandler('seekforward', () => {
      controlsRef.current.onSeekBySeconds(15)
    })
    navigator.mediaSession.setActionHandler('previoustrack', null)
    navigator.mediaSession.setActionHandler('nexttrack', null)

    return () => {
      navigator.mediaSession.metadata = null
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.setActionHandler('seekbackward', null)
      navigator.mediaSession.setActionHandler('seekforward', null)
    }
  }, [track?.title, track?.artist, track?.album, track?.artworkUrl])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = controls.playing ? 'playing' : 'paused'
  }, [controls.playing])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    if (!('setPositionState' in navigator.mediaSession)) return

    const duration = Number.isFinite(controls.duration) && controls.duration > 0
      ? controls.duration
      : undefined

    if (duration === undefined) return

    try {
      navigator.mediaSession.setPositionState({
        duration,
        position: Math.min(Math.max(0, controls.currentTime), duration),
        playbackRate: 1,
      })
    } catch {
      /* Safari may reject until media is ready */
    }
  }, [controls.currentTime, controls.duration, controls.playing])
}
