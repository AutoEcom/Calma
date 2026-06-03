import { useEffect, useState } from 'react'

const VIEWER_BASE = 18

/**
 * Display count = real viewers (Mux Data when wired) + base + gentle drift.
 * Drift updates every 30s while the stream is considered live.
 */
export function useDisplayViewerCount(streamActive: boolean) {
  const [realViewers, setRealViewers] = useState(0)
  const [drift, setDrift] = useState(0)

  useEffect(() => {
    if (!streamActive) {
      setDrift(0)
      return
    }

    const tick = () => {
      setDrift((d) => {
        const delta = Math.floor(Math.random() * 7) - 2
        return Math.max(-4, Math.min(14, d + delta))
      })
      // TODO: fetch concurrent viewers from Mux Data API via Edge Function when available
      if (Math.random() > 0.65) {
        setRealViewers((r) => r + Math.floor(Math.random() * 2))
      }
    }

    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [streamActive])

  const display =
    streamActive ? Math.max(VIEWER_BASE, realViewers + VIEWER_BASE + drift) : VIEWER_BASE

  return { display, realViewers }
}
