/**
 * Detect native spatial / E-AC3 (Dolby Atmos) playback support (Safari iOS/macOS primary).
 */
export async function detectSpatialAudioSupport(): Promise<boolean> {
  if (typeof document === 'undefined') return false

  const audio = document.createElement('audio')
  const eac3 =
    audio.canPlayType('audio/mp4; codecs="ec-3"') ||
    audio.canPlayType('audio/eac3') ||
    audio.canPlayType('audio/mp4; codecs="ec+3"')

  if (eac3 === 'probably') return true

  const isApple =
    /iPhone|iPad|iPod|Macintosh|Mac OS X/.test(navigator.userAgent) &&
    !!(audio.canPlayType('application/vnd.apple.mpegurl') || audio.canPlayType('application/x-mpegURL'))

  if (!isApple) return eac3 === 'maybe'

  if ('mediaCapabilities' in navigator) {
    try {
      const result = await navigator.mediaCapabilities.decodingInfo({
        type: 'file',
        audio: {
          contentType: 'audio/mp4; codecs="ec-3"',
          channels: '6',
          bitrate: 256000,
          samplerate: 48000,
        },
      })
      if (result.supported) return true
    } catch {
      /* fall through */
    }
  }

  return eac3 === 'maybe' || isApple
}
