import MuxPlayer from '@mux/mux-player-react'
import type MuxPlayerElement from '@mux/mux-player'
import { forwardRef } from 'react'
import { MUX_SANCTUARY_HLS_CONFIG } from '../../lib/muxStreamPlayback'

type Props = {
  src?: string | null
  playbackId?: string | null
  onPlay?: () => void
  onPause?: () => void
  onTimeUpdate?: () => void
  onDurationChange?: () => void
  onEnded?: () => void
  onLoadStart?: () => void
  onCanPlay?: () => void
  onWaiting?: () => void
  onError?: () => void
}

/** Invisible Mux media engine — always clipped; never covers the custom player UI. */
export const HeadlessMuxStream = forwardRef<MuxPlayerElement, Props>(function HeadlessMuxStream(
  {
    src,
    playbackId,
    onPlay,
    onPause,
    onTimeUpdate,
    onDurationChange,
    onEnded,
    onLoadStart,
    onCanPlay,
    onWaiting,
    onError,
  },
  ref,
) {
  const hasSource = Boolean(playbackId || src)

  return (
    <div className="headless-mux-stream-shell" aria-hidden="true">
      {hasSource ? (
        <MuxPlayer
          ref={ref}
          src={playbackId ? undefined : (src ?? undefined)}
          playbackId={playbackId ?? undefined}
          streamType="on-demand"
          audio
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          nohotkeys
          hotkeys=""
          minPreloadSegments={4}
          disableTracking
          proudlyDisplayMuxBadge={false}
          className="headless-mux-stream"
          _hlsConfig={MUX_SANCTUARY_HLS_CONFIG}
          onPlay={onPlay}
          onPause={onPause}
          onTimeUpdate={onTimeUpdate}
          onDurationChange={onDurationChange}
          onEnded={onEnded}
          onLoadStart={onLoadStart}
          onCanPlay={onCanPlay}
          onWaiting={onWaiting}
          onError={onError}
        />
      ) : null}
    </div>
  )
})
