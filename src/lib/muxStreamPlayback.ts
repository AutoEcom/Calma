/** hls.js tuning for Mux VOD — deep forward buffer to absorb mobile network jitter. */
export const MUX_SANCTUARY_HLS_CONFIG = {
  enableWorker: true,
  lowLatencyMode: false,
  startFragPrefetch: true,
  progressive: true,
  maxBufferLength: 90,
  maxMaxBufferLength: 300,
  backBufferLength: 90,
  frontBufferFlushThreshold: 120,
  maxBufferSize: 120 * 1000 * 1000,
  maxBufferHole: 0.5,
  nudgeMaxRetry: 10,
  fragLoadingMaxRetry: 8,
  manifestLoadingMaxRetry: 6,
  levelLoadingMaxRetry: 6,
  capLevelToPlayerSize: false,
} as const

export function isMuxStreamUrl(url: string): boolean {
  return url.trim().includes('stream.mux.com/')
}

export function parseMuxPlaybackId(url: string): string | null {
  const match = url.trim().match(/stream\.mux\.com\/([^/?#.]+)/i)
  return match?.[1] ?? null
}
