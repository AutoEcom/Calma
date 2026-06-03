import { Check, Copy, Loader2, Radio } from 'lucide-react'
import { useState } from 'react'
import { createMuxStreamForClass } from '../../lib/muxStream'
import { cn } from '../../lib/utils'

type Props = {
  classId: string
  playbackId: string | null
  streamKey: string | null
  muxStatus: string | null
  onUpdated: (next: {
    mux_playback_id: string
    mux_stream_key: string
    mux_status: string
    video_url?: string
  }) => void
}

export function MuxStreamSettings({
  classId,
  playbackId,
  streamKey,
  muxStatus,
  onUpdated,
}: Props) {
  const [provisioning, setProvisioning] = useState(false)
  const [provisionError, setProvisionError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function provision(force = false) {
    setProvisionError(null)
    setProvisioning(true)
    const { data, error } = await createMuxStreamForClass(classId, { force })
    setProvisioning(false)
    if (error) {
      setProvisionError(error)
      return
    }
    if (data) {
      onUpdated({
        mux_playback_id: data.playback_id,
        mux_stream_key: data.stream_key,
        mux_status: data.mux_status,
        video_url: data.playback_url,
      })
    }
  }

  async function copyStreamKey() {
    if (!streamKey) return
    try {
      await navigator.clipboard.writeText(streamKey)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setProvisionError('Could not copy to clipboard')
    }
  }

  const hasStream = Boolean(playbackId && streamKey)

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--accent)]/25 bg-[var(--page-bg)]/50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
            <Radio className="h-4 w-4 text-[var(--accent)]" />
            Stream settings (Mux)
          </h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Use the stream key in OBS (Custom → Server: rtmps://global-live.mux.com:443/app). Students
            watch via the live room player.
          </p>
        </div>
        <button
          type="button"
          disabled={provisioning}
          onClick={() => void provision(hasStream)}
          className={cn(
            'rounded-full border px-4 py-2 text-xs font-semibold transition',
            hasStream
              ? 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]'
              : 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20',
          )}
        >
          {provisioning ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Creating…
            </span>
          ) : hasStream ? (
            'Regenerate stream'
          ) : (
            'Create Mux live stream'
          )}
        </button>
      </div>

      {provisionError && (
        <p className="text-sm text-red-400">{provisionError}</p>
      )}

      {hasStream ? (
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Status</p>
              <p className="font-medium capitalize text-[var(--text)]">{muxStatus ?? 'idle'}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[var(--text-muted)]">Playback ID</p>
              <p className="break-all font-mono text-xs text-[var(--text)]">{playbackId}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)]">Stream key (OBS)</p>
            <div className="mt-1.5 flex flex-wrap items-stretch gap-2">
              <code className="min-w-0 flex-1 break-all rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 font-mono text-xs text-[var(--accent)]">
                {streamKey}
              </code>
              <button
                type="button"
                onClick={() => void copyStreamKey()}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-4 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy key
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            RTMP URL:{' '}
            <span className="font-mono text-[var(--text)]">rtmps://global-live.mux.com:443/app</span>
          </p>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">
          No Mux stream yet. Save the class, then create a live stream to get an OBS stream key.
        </p>
      )}
    </section>
  )
}
