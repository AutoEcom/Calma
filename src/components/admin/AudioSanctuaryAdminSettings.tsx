import { Check, Headphones, Loader2, Upload, Waves } from 'lucide-react'
import { useState } from 'react'
import {
  AUDIO_SANCTUARY_CATEGORIES,
  CATEGORY_LABELS,
  MEDITATIONS_BUCKET,
  type AudioSanctuaryCategory,
  type AudioSanctuaryStatus,
} from '../../lib/audioSanctuary'
import { slugifyTitle } from '../../lib/slugify'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'

export const BADGE_PRESETS = [
  'Best Seller',
  'New Moon Protocol',
  'Quantum Exclusive',
] as const

export type AudioSanctuaryFormState = {
  audioHlsAtmosKey: string
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

export function AudioSanctuaryAdminSettings({ title, state, onChange }: Props) {
  const slug = slugifyTitle(title) || 'meditation'

  async function uploadMaster(file: File, variant: 'atmos' | 'stereo') {
    if (!file.name.endsWith('.m3u8')) {
      return { error: 'Upload the HLS master playlist (.m3u8).' }
    }
    const path = `${slug}/${variant}/master.m3u8`
    const { error } = await supabase.storage.from(MEDITATIONS_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'application/vnd.apple.mpegurl',
    })
    if (error) return { error: error.message }
    if (variant === 'atmos') onChange({ audioHlsAtmosKey: path })
    else onChange({ audioHlsStereoKey: path })
    return { path }
  }

  function suggestPaths() {
    onChange({
      audioHlsAtmosKey: `${slug}/atmos/master.m3u8`,
      audioHlsStereoKey: `${slug}/stereo/master.m3u8`,
    })
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--accent)]/25 bg-[var(--page-bg)]/50 p-5">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <Headphones className="h-4 w-4 text-[var(--accent)]" />
          Audio Sanctuary upload settings
        </h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Private bucket <span className="font-mono text-[var(--accent)]">meditations</span>.
          Upload masters or paste paths after uploading via Storage. Signed playback uses the edge
          function (60s URLs).
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={suggestPaths}
          className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Suggest paths from title
        </button>
        <span className="text-xs text-[var(--text-muted)]">
          Slug: <code className="text-[var(--text)]">{slug}</code>
        </span>
      </div>

      <RawMasterUpload slug={slug} />

      <div className="grid gap-4 lg:grid-cols-2">
        <HlsPathField
          label="Atmos HLS path"
          hint="Dolby Atmos master .m3u8"
          value={state.audioHlsAtmosKey}
          onChange={(v) => onChange({ audioHlsAtmosKey: v })}
          onUpload={(f) => uploadMaster(f, 'atmos')}
        />
        <HlsPathField
          label="Stereo HLS path"
          hint="Studio stereo master .m3u8"
          value={state.audioHlsStereoKey}
          onChange={(v) => onChange({ audioHlsStereoKey: v })}
          onUpload={(f) => uploadMaster(f, 'stereo')}
        />
      </div>
    </section>
  )
}

const RAW_AUDIO_ACCEPT =
  'audio/wav,audio/mpeg,audio/mp4,video/mp4,.wav,.mp3,.mp4,audio/x-wav'

function RawMasterUpload({ slug }: { slug: string }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedPath, setUploadedPath] = useState<string | null>(null)

  async function onFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp3'
    const allowed = ['wav', 'mp3', 'mp4', 'm4a']
    if (!allowed.includes(ext)) {
      return { error: 'Use .wav, .mp3, or .mp4 for the stereo master.' }
    }
    const path = `${slug}/masters/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { error } = await supabase.storage.from(MEDITATIONS_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || undefined,
    })
    if (error) return { error: error.message }
    return { path }
  }

  return (
    <div className="rounded-xl border border-dashed border-[var(--accent)]/35 bg-[var(--surface)]/40 p-4">
      <p className="text-xs font-semibold text-[var(--text)]">HD stereo master (raw upload)</p>
      <p className="mt-1 text-[10px] text-[var(--text-muted)]">
        Upload the high-definition source (.wav, .mp3, .mp4) before HLS packaging. Stored privately
        in <span className="font-mono">meditations/{slug}/masters/</span>.
      </p>
      <label
        className={cn(
          'mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-4 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        Upload master audio
        <input
          type="file"
          accept={RAW_AUDIO_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (!f) return
            setUploadError(null)
            setUploading(true)
            void onFile(f).then((res) => {
              setUploading(false)
              if (res.error) setUploadError(res.error)
              else if (res.path) setUploadedPath(res.path)
            })
          }}
        />
      </label>
      {uploadError && <p className="mt-2 text-xs text-red-400">{uploadError}</p>}
      {uploadedPath && (
        <p className="mt-2 flex items-center gap-1 font-mono text-[10px] text-[var(--accent)]">
          <Check className="h-3.5 w-3.5 shrink-0" />
          {uploadedPath}
        </p>
      )}
    </div>
  )
}

function HlsPathField({
  label,
  hint,
  value,
  onChange,
  onUpload,
}: {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
  onUpload: (file: File) => Promise<{ error?: string; path?: string }>
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedPath, setUploadedPath] = useState<string | null>(null)

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
        placeholder={`${slugifyTitle('sample')}/atmos/master.m3u8`}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--page-bg)] px-3 py-2 font-mono text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
      />
      <label
        className={cn(
          'inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        Upload .m3u8
        <input
          type="file"
          accept=".m3u8,application/vnd.apple.mpegurl,audio/mpegurl"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (!f) return
            setUploadError(null)
            setUploading(true)
            void onUpload(f).then((res) => {
              setUploading(false)
              if (res.error) setUploadError(res.error)
              else if (res.path) setUploadedPath(res.path)
            })
          }}
        />
      </label>
      {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
      {uploadedPath && (
        <p className="flex items-center gap-1 text-xs text-[var(--accent)]">
          <Check className="h-3.5 w-3.5" />
          Uploaded: {uploadedPath}
        </p>
      )}
    </div>
  )
}
