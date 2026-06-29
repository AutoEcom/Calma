/**
 * Strict synchronous EC-3 / Dolby Atmos decode capability probe.
 * iOS without spatial output (e.g. no AirPods) usually returns empty or "maybe" — not "probably".
 */
export function isAtmosEc3PlaybackSupported(): boolean {
  if (typeof window === 'undefined') return false

  if (typeof window.MediaSource !== 'undefined') {
    try {
      if (window.MediaSource.isTypeSupported('audio/mp4; codecs="ec-3"')) {
        return true
      }
    } catch {
      /* fall through */
    }
  }

  if (typeof Audio === 'undefined') return false
  const audio = new Audio()
  return audio.canPlayType('audio/mp4; codecs="ec-3"') === 'probably'
}

/**
 * Detect native spatial / E-AC3 (Dolby Atmos) playback support (Safari iOS/macOS primary).
 */
export async function detectSpatialAudioSupport(): Promise<boolean> {
  if (typeof document === 'undefined') return false

  if (isAtmosEc3PlaybackSupported()) return true

  if ('mediaCapabilities' in navigator) {
    try {
      const result = await navigator.mediaCapabilities.decodingInfo({
        type: 'file',
        audio: {
          contentType: 'audio/mp4; codecs="ec-3"',
          channels: '16',
          bitrate: 512000,
          samplerate: 48000,
        },
      })
      return result.supported
    } catch {
      return false
    }
  }

  return false
}
