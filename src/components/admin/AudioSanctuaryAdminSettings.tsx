import { Check, Headphones, Loader2, Upload, Waves } from 'lucide-react'
import { useRef, useState } from 'react'
import {
  AUDIO_SANCTUARY_CATEGORIES,
  CATEGORY_LABELS,
  type AudioSanctuaryCategory,
  type AudioSanctuaryStatus,
} from '../../lib/audioSanctuary'
import { isLikelyAtmosSourceUrl } from '../../lib/atmosSourceUrl'
import { directUploadToMuxHls } from '../../lib/muxDirectUpload'
import { slugifyTitle } from '../../lib/slugify'
import { cn } from '../../lib/utils'

export const BADGE_PRESETS = [
  'Best Seller',
  'New Moon Protocol',
  'Quantum Exclusive',
] as const

export type AudioSanctuaryFormState = {
  atmosSourceUrl: string
  audioHlsStereoKey: string
  usageTip: string
  sanctuaryStatus: AudioSanctuaryStatus
  badge: string
  audioCategory: AudioSanctuaryCategory
  creditGuide: string
  creditFrequency: string
  creditStudio: string
}

type Props = {
  title: string
  state: AudioSanctuaryFormState
  onChange: (patch: Partial<AudioSanctuaryFormState>) => void
}

const RAW_AUDIO_ACCEPT =
  'audio/wav,audio/mpeg,audio/mp4,video/mp4,.wav,.mp3,.mp4,.m4a,audio/x-wav'

export function AudioSanctuaryAdminSettings({ title, state, onChange }: Props) {
  const slug = slugifyTitle(title) || 'meditation'

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--accent)]/25 bg-[var(--page-bg)]/50 p-5">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <Headphones className="h-4 w-4 text-[var(--accent)]" />
          Audio Sanctuary upload settings
        </h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Upload large masters directly to our cinematic broadcast pipeline — no local preview, no
          storage cap. Completed uploads auto-fill the HLS stream URL for each variant.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="text-[var(--text-muted)]">Sanctuary category</span>
          <select
            value={state.audioCategory}
            onChange={(e) =>
              onChange({ audioCategory: e.target.value as AudioSanctuaryCategory })
            }
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
          >
            {AUDIO_SANCTUARY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-[var(--text-muted)]">Sanctuary status</span>
          <select
            value={state.sanctuaryStatus}
            onChange={(e) =>
              onChange({ sanctuaryStatus: e.target.value as AudioSanctuaryStatus })
            }
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
          >
            <option value="active">Active — streamable</option>
            <option value="coming_soon">Coming soon — waitlist</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-[var(--text-muted)]">Premium badge</span>
          <select
            value={BADGE_PRESETS.includes(state.badge as (typeof BADGE_PRESETS)[number]) ? state.badge : '__custom__'}
            onChange={(e) => {
              if (e.target.value === '__custom__') onChange({ badge: '' })
              else onChange({ badge: e.target.value })
            }}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
          >
            {BADGE_PRESETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
            <option value="__custom__">Custom label…</option>
          </select>
          {(!state.badge || !BADGE_PRESETS.includes(state.badge as (typeof BADGE_PRESETS)[number])) && (
            <input
              value={state.badge}
              onChange={(e) => onChange({ badge: e.target.value })}
              placeholder="Custom badge text"
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
          )}
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-[var(--text-muted)]">Guide name</span>
          <input
            value={state.creditGuide}
            onChange={(e) => onChange({ creditGuide: e.target.value })}
            placeholder="Maya"
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--text-muted)]">Frequency / beats</span>
          <input
            value={state.creditFrequency}
            onChange={(e) => onChange({ creditFrequency: e.target.value })}
            placeholder="528Hz / Theta Beats"
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--text-muted)]">Studio</span>
          <input
            value={state.creditStudio}
            onChange={(e) => onChange({ creditStudio: e.target.value })}
            placeholder="Pro Audio Lab"
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-[var(--text-muted)]">Usage protocol (usage_tip)</span>
        <textarea
          value={state.usageTip}
          onChange={(e) => onChange({ usageTip: e.target.value })}
          rows={3}
          placeholder="Listen for 21 consecutive days during the New Moon cycle."
          className="mt-1.5 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
        />
      </label>

      <p className="text-xs text-[var(--text-muted)]">
        Slug: <code className="text-[var(--text)]">{slug}</code>
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <AtmosSourceUrlField
          value={state.atmosSourceUrl}
          onChange={(v) => onChange({ atmosSourceUrl: v })}
        />
        <MuxStreamField
          label="Stereo HLS path"
          hint="Studio stereo master — .mp3, .mp4, or .wav"
          variant="stereo"
          slug={slug}
          value={state.audioHlsStereoKey}
          onChange={(v) => onChange({ audioHlsStereoKey: v })}
        />
      </div>
    </section>
  )
}

function AtmosSourceUrlField({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const trimmed = value.trim()
  const valid = !trimmed || isLikelyAtmosSourceUrl(trimmed)

  return (
    <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
        <Waves className="h-3.5 w-3.5 text-[var(--accent)]" />
        Dolby Atmos Source URL (Google Drive / Direct Link)
      </p>
      <p className="text-[10px] text-[var(--text-muted)]">
        Paste a Google Drive share link or direct HTTPS URL to the spatial master (.mp4 with
        ec-3). Bypasses Mux — Safari CoreAudio handles native Atmos pass-through.
      </p>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://drive.google.com/file/d/…/view"
        className={cn(
          'w-full rounded-lg border bg-[var(--page-bg)] px-3 py-2 font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]',
          valid ? 'border-[var(--border)]' : 'border-red-400/60',
        )}
      />
      {!valid && (
        <p className="text-xs text-red-400">Enter a valid https URL or Google Drive share link.</p>
      )}
    </div>
  )
}

function MuxStreamField({
  label,
  hint,
  variant,
  slug,
  value,
  onChange,
}: {
  label: string
  hint: string
  variant: 'atmos' | 'stereo'
  slug: string
  value: string
  onChange: (v: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'processing'>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string | null>(null)

  async function handleFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const allowed = ['wav', 'mp3', 'mp4', 'm4a']
    if (!allowed.includes(ext)) {
      setUploadError('Use .wav, .mp3, .mp4, or .m4a for direct upload.')
      return
    }

    setUploadError(null)
    setUploading(true)
    setProgress(0)
    setPhase('uploading')

    try {
      const result = await directUploadToMuxHls(file, {
        passthrough: JSON.stringify({ slug, variant }),
        onProgress: (pct) => {
          setProgress(pct)
          if (pct >= 100) setPhase('processing')
        },
      })

      onChange(result.hls_url)
      setLastUploadedUrl(result.hls_url)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      setPhase('idle')
      setProgress(0)
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
        <Waves className="h-3.5 w-3.5 text-[var(--accent)]" />
        {label}
      </p>
      <p className="text-[10px] text-[var(--text-muted)]">{hint}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://stream.mux.com/{playback_id}.m3u8"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--page-bg)] px-3 py-2 font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        {phase === 'processing' ? 'Processing on Mux…' : 'Direct upload to Mux'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={RAW_AUDIO_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) void handleFile(f)
        }}
      />
      {uploading && (
        <div className="space-y-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round(progress))}%` }}
            />
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">
            {phase === 'processing'
              ? 'Encoding HLS — this can take a minute…'
              : `Uploading… ${Math.round(progress)}%`}
          </p>
        </div>
      )}
      {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
      {lastUploadedUrl && !uploadError && (
        <p className="flex items-start gap-1 text-xs text-[var(--accent)]">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="break-all font-mono text-[10px]">{lastUploadedUrl}</span>
        </p>
      )}
    </div>
  )
}
