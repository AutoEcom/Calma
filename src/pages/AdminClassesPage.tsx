import {
  Calendar,
  Check,
  Headphones,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Video,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import type { Json } from '../lib/database.types'
import type { ClassDetails } from '../lib/classTypes'
import { supabase } from '../lib/supabase'
import { normalizeWhatToExpect } from '../lib/whatToExpect'
import { useAuth } from '../providers/AuthProvider'
import { cn } from '../lib/utils'
import {
  GUIDED_MEDITATION_TYPE,
  LIVE_SESSION_TYPE_OPTIONS,
  SESSION_LEVEL_OPTIONS,
  SESSION_LEVEL_VALUES,
  SESSION_TYPE_VALUES,
  type SessionLevelValue,
  type SessionTypeValue,
} from '../components/class/ClassBadges'
import {
  AudioSanctuaryAdminSettings,
  type AudioSanctuaryFormState,
} from '../components/admin/AudioSanctuaryAdminSettings'
import { MuxStreamSettings } from '../components/admin/MuxStreamSettings'
import {
  CATEGORY_LABELS,
  parseAudioCredits,
  type AudioSanctuaryCategory,
  type AudioSanctuaryStatus,
} from '../lib/audioSanctuary'
import { createMuxStreamForClass } from '../lib/muxStream'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function defaultAudioFormState(): AudioSanctuaryFormState {
  return {
    audioHlsAtmosKey: '',
    audioHlsStereoKey: '',
    usageTip: '',
    sanctuaryStatus: 'active',
    badge: '',
    audioCategory: 'celestial_rituals',
    creditGuide: '',
    creditFrequency: '',
    creditStudio: '',
  }
}

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function bulletsFromDb(raw: Json | undefined): string[] {
  const list = normalizeWhatToExpect(raw as unknown)
  return list.length > 0 ? list : ['']
}

export function AdminClassesPage() {
  const navigate = useNavigate()
  const { user, member, role, loading: authLoading } = useAuth()

  const defaultInstructor = useMemo(() => {
    if (!member) return ''
    return [member.first_name, member.last_name].filter(Boolean).join(' ').trim()
  }, [member])

  const [classesList, setClassesList] = useState<ClassDetails[]>([])
  const [listLoading, setListLoading] = useState(true)

  /** null = creating new class (uses draftId for storage paths + insert id) */
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftId, setDraftId] = useState(() => crypto.randomUUID())

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [instructorName, setInstructorName] = useState('')
  const [scheduledLocal, setScheduledLocal] = useState(() =>
    toDatetimeLocalValue(new Date(Date.now() + 86400000).toISOString()),
  )
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [isFeatured, setIsFeatured] = useState(false)
  const [customSlug, setCustomSlug] = useState('')
  const [priceEuros, setPriceEuros] = useState('25')
  const [videoUrl, setVideoUrl] = useState('')
  const [muxPlaybackId, setMuxPlaybackId] = useState<string | null>(null)
  const [muxStreamKey, setMuxStreamKey] = useState<string | null>(null)
  const [muxStatus, setMuxStatus] = useState<string>('idle')
  const [points, setPoints] = useState<string[]>([''])
  const [maxCapacity, setMaxCapacity] = useState(20)
  const [sessionType, setSessionType] = useState<SessionTypeValue>('yoga')
  const [sessionLevel, setSessionLevel] = useState<SessionLevelValue>('all')
  const [audioForm, setAudioForm] = useState<AudioSanctuaryFormState>(defaultAudioFormState)

  const isMeditationMode = sessionType === GUIDED_MEDITATION_TYPE

  function setLiveMode() {
    setSessionType((prev) =>
      prev === GUIDED_MEDITATION_TYPE ? 'yoga' : prev,
    )
  }

  function setMeditationMode() {
    setSessionType(GUIDED_MEDITATION_TYPE)
    setAudioForm((prev) => (prev.audioCategory ? prev : defaultAudioFormState()))
  }

  function startNewLiveClass() {
    resetFormForNew()
    setSessionType('yoga')
  }

  function startNewMeditation() {
    resetFormForNew()
    setSessionType(GUIDED_MEDITATION_TYPE)
    setAudioForm(defaultAudioFormState())
    setDurationMinutes(35)
    setPriceEuros('19')
    setTitle('')
  }

  const [imagePublicUrl, setImagePublicUrl] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const effectiveId = editingId ?? draftId

  const loadList = useCallback(async () => {
    setListLoading(true)
    const { data, error: qErr } = await supabase
      .from('classes')
      .select('*')
      .order('scheduled_at', { ascending: false })
      .limit(50)
    setListLoading(false)
    if (qErr) return
    setClassesList((data ?? []) as ClassDetails[])
  }, [])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    if (!defaultInstructor) return
    if (editingId === null) {
      setInstructorName((prev) => (prev.trim() === '' ? defaultInstructor : prev))
    }
  }, [defaultInstructor, editingId])

  function resetFormForNew() {
    setEditingId(null)
    setDraftId(crypto.randomUUID())
    setTitle('')
    setDescription('')
    setInstructorName(defaultInstructor)
    setScheduledLocal(toDatetimeLocalValue(new Date(Date.now() + 86400000).toISOString()))
    setDurationMinutes(60)
    setIsFeatured(false)
    setCustomSlug('')
    setPriceEuros('25')
    setVideoUrl('')
    setMuxPlaybackId(null)
    setMuxStreamKey(null)
    setMuxStatus('idle')
    setPoints([''])
    setMaxCapacity(20)
    setSessionType('yoga')
    setSessionLevel('all')
    setAudioForm(defaultAudioFormState())
    setImagePublicUrl(null)
    setImageError(null)
    setError(null)
  }

  function openEdit(row: ClassDetails) {
    setEditingId(row.id)
    setTitle(row.title)
    setDescription(row.description ?? '')
    setInstructorName(row.instructor_name)
    setScheduledLocal(toDatetimeLocalValue(row.scheduled_at))
    setDurationMinutes(row.duration_minutes)
    setIsFeatured(Boolean(row.is_featured))
    setCustomSlug(row.slug ?? '')
    setPriceEuros((row.price_in_cents / 100).toFixed(2))
    setVideoUrl(row.video_url ?? '')
    setMuxPlaybackId(row.mux_playback_id ?? null)
    setMuxStreamKey(row.mux_stream_key ?? null)
    setMuxStatus(row.mux_status ?? 'idle')
    setPoints(bulletsFromDb(row.what_to_expect))
    setImagePublicUrl(row.image_url)
    setMaxCapacity(
      typeof row.max_capacity === 'number' && row.max_capacity > 0 ? row.max_capacity : 20,
    )
    const st = row.session_type as string | undefined
    const isMeditation = Boolean(row.is_audio_sanctuary) || st === GUIDED_MEDITATION_TYPE
    setSessionType(
      isMeditation
        ? GUIDED_MEDITATION_TYPE
        : st && SESSION_TYPE_VALUES.includes(st as SessionTypeValue)
          ? (st as SessionTypeValue)
          : 'yoga',
    )
    const credits = parseAudioCredits(row.audio_credits)
    setAudioForm({
      audioHlsAtmosKey: row.audio_hls_atmos_key ?? '',
      audioHlsStereoKey: row.audio_hls_stereo_key ?? '',
      usageTip: row.usage_tip ?? '',
      sanctuaryStatus:
        (row.sanctuary_status as AudioSanctuaryStatus | null) ?? 'coming_soon',
      badge: row.badge ?? '',
      audioCategory:
        (row.audio_sanctuary_category as AudioSanctuaryCategory | null) ??
        'celestial_rituals',
      creditGuide: credits.guide ?? '',
      creditFrequency: credits.frequency ?? '',
      creditStudio: credits.studio ?? '',
    })
    if (row.audio_cover_art_url && !row.image_url) {
      setImagePublicUrl(row.audio_cover_art_url)
    }
    if (!isMeditation) {
      setAudioForm(defaultAudioFormState())
    }
    const sl = row.session_level as string | undefined
    setSessionLevel(
      sl && SESSION_LEVEL_VALUES.includes(sl as SessionLevelValue)
        ? (sl as SessionLevelValue)
        : 'all',
    )
    setImageError(null)
    setError(null)
  }

  async function uploadCoverFile(file: File) {
    setImageError(null)
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image must be 5 MB or smaller.')
      return
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'
    const path = `classes/${effectiveId}/cover-${Date.now()}.${safeExt}`

    setImageUploading(true)
    const { error: upErr } = await supabase.storage.from('class-media').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })
    setImageUploading(false)

    if (upErr) {
      setImageError(upErr.message)
      return
    }

    const { data: pub } = supabase.storage.from('class-media').getPublicUrl(path)
    setImagePublicUrl(pub.publicUrl)
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (f) void uploadCoverFile(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('image/')) void uploadCoverFile(f)
  }

  function addPoint() {
    setPoints((p) => [...p, ''])
  }

  function removePoint(i: number) {
    setPoints((p) => (p.length <= 1 ? p : p.filter((_, idx) => idx !== i)))
  }

  function updatePoint(i: number, v: string) {
    setPoints((p) => p.map((x, idx) => (idx === i ? v : x)))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!member?.id) {
      setError('Member profile missing.')
      return
    }

    const euros = Number(priceEuros)
    if (!title.trim() || !instructorName.trim()) {
      setError('Title and instructor are required.')
      return
    }
    if (!Number.isFinite(euros) || euros < 0) {
      setError('Enter a valid price.')
      return
    }
    if (!isMeditationMode) {
      if (!Number.isFinite(maxCapacity) || maxCapacity < 1 || maxCapacity > 500) {
        setError('Max capacity must be between 1 and 500.')
        return
      }
    }

    const scheduledAt = isMeditationMode
      ? new Date()
      : new Date(scheduledLocal)
    if (!isMeditationMode && Number.isNaN(scheduledAt.getTime())) {
      setError('Invalid date / time.')
      return
    }

    if (
      isMeditationMode &&
      audioForm.sanctuaryStatus === 'active' &&
      !audioForm.audioHlsStereoKey.trim() &&
      !audioForm.audioHlsAtmosKey.trim()
    ) {
      setError('Active meditations require at least one HLS master path (Atmos or Stereo).')
      return
    }

    const cleanedPoints = points.map((s) => s.trim()).filter(Boolean)
    const price_in_cents = Math.round(euros * 100)

    setSaving(true)

    const audioCredits: Record<string, string> = {}
    if (audioForm.creditGuide.trim()) audioCredits.guide = audioForm.creditGuide.trim()
    if (audioForm.creditFrequency.trim()) audioCredits.frequency = audioForm.creditFrequency.trim()
    if (audioForm.creditStudio.trim()) audioCredits.studio = audioForm.creditStudio.trim()

    const slugPatch = customSlug.trim()
      ? { slug: customSlug.trim().toLowerCase().replace(/\s+/g, '-') }
      : {}

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      instructor_name: instructorName.trim(),
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: Math.max(1, Math.floor(durationMinutes)),
      is_featured: isFeatured,
      ...slugPatch,
      price_in_cents,
      price_in_calma: 0,
      video_url: isMeditationMode ? null : videoUrl.trim() || null,
      image_url: imagePublicUrl,
      audio_cover_art_url: isMeditationMode ? imagePublicUrl : null,
      what_to_expect: cleanedPoints as unknown as Json,
      is_live_active: false,
      max_capacity: isMeditationMode ? 1 : Math.floor(maxCapacity),
      session_type: isMeditationMode ? GUIDED_MEDITATION_TYPE : sessionType,
      session_level: sessionLevel,
      is_audio_sanctuary: isMeditationMode,
      audio_sanctuary_category: isMeditationMode ? audioForm.audioCategory : null,
      sanctuary_status: isMeditationMode ? audioForm.sanctuaryStatus : null,
      badge: isMeditationMode ? audioForm.badge.trim() || null : null,
      usage_tip: isMeditationMode ? audioForm.usageTip.trim() || null : null,
      audio_hls_atmos_key: isMeditationMode ? audioForm.audioHlsAtmosKey.trim() || null : null,
      audio_hls_stereo_key: isMeditationMode ? audioForm.audioHlsStereoKey.trim() || null : null,
      audio_credits: isMeditationMode ? (audioCredits as unknown as Json) : ({} as Json),
    }

    const savedClassId = editingId ?? draftId

    if (editingId) {
      const { error: upErr } = await supabase.from('classes').update(payload).eq('id', editingId)
      if (upErr) {
        setSaving(false)
        setError(upErr.message)
        return
      }
    } else {
      const { error: insErr } = await supabase.from('classes').insert({
        id: savedClassId,
        ...payload,
        created_by: member.id,
      })
      if (insErr) {
        setSaving(false)
        setError(insErr.message)
        return
      }
    }

    if (!isMeditationMode && !editingId && !muxPlaybackId) {
      const { data: mux, error: muxErr } = await createMuxStreamForClass(savedClassId)
      if (muxErr) {
        setSaving(false)
        setError(`Class saved, but Mux stream failed: ${muxErr}`)
        await loadList()
        setEditingId(savedClassId)
        return
      }
      if (mux) {
        setMuxPlaybackId(mux.playback_id)
        setMuxStreamKey(mux.stream_key)
        setMuxStatus(mux.mux_status)
        if (mux.playback_url) setVideoUrl(mux.playback_url)
      }
    }

    setSaving(false)
    await loadList()

    navigate('/', {
      replace: false,
      state: {
        adminClassSaved: true,
        savedTitle: title.trim(),
      },
    })
  }

  if (authLoading) {
    return (
      <div className="flex justify-center py-24 text-[var(--text-muted)]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)]" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: '/admin/classes' }} />
  }

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <header className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-8 shadow-[0_24px_80px_-48px_rgba(45,212,191,0.35)]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-warm)] to-transparent"
          aria-hidden
        />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              Studio admin
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">
              Class &amp; meditation creator
            </h1>
            <p className="max-w-xl text-sm text-[var(--text-muted)]">
              Live studio sessions (Mux) and{' '}
              <span className="text-[var(--accent)]">Audio Sanctuary</span> guided meditations.
              Covers upload to <span className="text-[var(--accent)]">class-media</span>; HLS masters
              to private <span className="text-[var(--accent)]">meditations</span> storage.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startNewLiveClass}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--page-bg)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:border-[var(--accent)]"
            >
              <Plus className="h-4 w-4 text-[var(--accent)]" />
              New live class
            </button>
            <button
              type="button"
              onClick={startNewMeditation}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent)]/15 px-4 py-2 text-sm font-semibold text-[var(--accent)] shadow-[0_0_24px_-8px_rgba(45,212,191,0.5)] hover:bg-[var(--accent)]/25"
            >
              <Headphones className="h-4 w-4" />
              New meditation
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--on-accent)] hover:opacity-90"
            >
              View site
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr]">
        <aside className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Sessions &amp; meditations
            </h2>
            {listLoading && <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />}
          </div>
          <div className="max-h-[min(70vh,520px)] space-y-2 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2">
            {classesList.length === 0 && !listLoading ? (
              <p className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">
                No classes yet. Start with &quot;New class&quot;.
              </p>
            ) : (
              classesList.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openEdit(c)}
                  className={cn(
                    'flex w-full flex-col gap-1 rounded-xl border px-3 py-3 text-left transition',
                    editingId === c.id
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-transparent bg-[var(--page-bg)]/50 hover:border-[var(--border)]',
                  )}
                >
                  <span className="line-clamp-2 text-sm font-medium text-[var(--text)]">
                    {c.title}
                  </span>
                  {c.is_audio_sanctuary ? (
                    <span className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <Headphones className="h-3 w-3 shrink-0 text-[var(--accent)]" />
                      <span className="font-medium text-[var(--accent)]">Meditation</span>
                      <span>· On demand</span>
                      {c.audio_sanctuary_category && (
                        <span className="text-[var(--text-muted)]">
                          · {CATEGORY_LABELS[c.audio_sanctuary_category as AudioSanctuaryCategory]}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {new Date(c.scheduled_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  )}
                  {c.is_audio_sanctuary && c.badge && (
                    <span className="text-[10px] font-medium text-[var(--accent-warm)]">{c.badge}</span>
                  )}
                  {c.is_audio_sanctuary && c.sanctuary_status === 'coming_soon' && (
                    <span className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                      Coming soon
                    </span>
                  )}
                  {c.created_by === member?.id && (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]">
                      You created
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
          <p className="px-1 text-xs text-[var(--text-muted)]">
            Editing uses the same form — select a class or start fresh.
          </p>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {isMeditationMode && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1 text-xs font-medium text-[var(--accent)]">
                <Headphones className="h-3 w-3" />
                Guided meditation
              </span>
            )}
            {editingId ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1 text-xs font-medium text-[var(--accent)]">
                <Pencil className="h-3 w-3" />
                Editing existing
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
                New draft
              </span>
            )}
            <span className="text-xs text-[var(--text-muted)]">
              Storage path: <code className="text-[var(--text)]">classes/{effectiveId.slice(0, 8)}…</code>
            </span>
          </div>

          <form
            onSubmit={onSubmit}
            className="space-y-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"
          >
            <section className="space-y-3 rounded-2xl border border-[var(--accent)]/30 bg-[var(--page-bg)]/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                What are you creating?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={setLiveMode}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-left text-sm transition',
                    !isMeditationMode
                      ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--text)] shadow-[0_0_20px_-8px_rgba(45,212,191,0.45)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]',
                  )}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <Video className="h-4 w-4 text-[var(--accent)]" />
                    Live class
                  </span>
                  <span className="mt-1 block text-xs opacity-80">Mux stream · schedule · capacity</span>
                </button>
                <button
                  type="button"
                  onClick={setMeditationMode}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-left text-sm transition',
                    isMeditationMode
                      ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--text)] shadow-[0_0_20px_-8px_rgba(45,212,191,0.45)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]',
                  )}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <Headphones className="h-4 w-4 text-[var(--accent)]" />
                    Guided meditation
                  </span>
                  <span className="mt-1 block text-xs opacity-80">
                    Audio Sanctuary · HLS · on demand
                  </span>
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text)]">Basics</h3>
              <label className="block text-sm">
                <span className="text-[var(--text-muted)]">Title</span>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] shadow-inner shadow-black/20 outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/40"
                  placeholder={
                    isMeditationMode ? 'New Moon Abundance' : 'Sunset Vinyasa Flow'
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="text-[var(--text-muted)]">Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="mt-1.5 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] shadow-inner shadow-black/20 outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/40"
                  placeholder="Describe the experience, level, and what to bring…"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-[var(--text-muted)]">Instructor name</span>
                  <input
                    required
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-[var(--text-muted)]">Duration (minutes)</span>
                  <input
                    type="number"
                    min={1}
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  />
                </label>
              </div>
              <label className="block text-sm">
                <span className="text-[var(--text-muted)]">Custom URL slug</span>
                <input
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="Leave blank — auto-generated from title on save"
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 font-mono text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                  Public path: /{isMeditationMode ? 'sanctuary' : 'class'}/your-slug
                </p>
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--page-bg)]/60 px-4 py-3.5">
                <span>
                  <span className="block text-sm font-medium text-[var(--text)]">
                    Feature on Main Landing Page
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                    Shows in the featured {isMeditationMode ? 'Audio Sanctuary' : 'Live Sessions'}{' '}
                    section on the home page.
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isFeatured}
                  onClick={() => setIsFeatured((v) => !v)}
                  className={cn(
                    'relative h-7 w-12 shrink-0 rounded-full transition',
                    isFeatured ? 'bg-[var(--accent)]' : 'bg-[var(--border)]',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition',
                      isFeatured ? 'left-[22px]' : 'left-0.5',
                    )}
                  />
                </button>
              </label>
              <div
                className={cn(
                  'grid gap-4',
                  isMeditationMode ? 'sm:grid-cols-2' : 'sm:grid-cols-3',
                )}
              >
                {!isMeditationMode && (
                  <label className="block text-sm">
                    <span className="text-[var(--text-muted)]">Max capacity</span>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      required
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                    />
                  </label>
                )}
                {!isMeditationMode ? (
                  <label className="block text-sm">
                    <span className="text-[var(--text-muted)]">Class type</span>
                    <select
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value as SessionTypeValue)}
                      className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                    >
                      {LIVE_SESSION_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div className="block text-sm">
                    <span className="text-[var(--text-muted)]">Content type</span>
                    <p className="mt-1.5 flex items-center gap-2 rounded-xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-4 py-3 text-sm font-medium text-[var(--accent)]">
                      <Headphones className="h-4 w-4 shrink-0" />
                      Guided meditation (Audio Sanctuary)
                    </p>
                  </div>
                )}
                <label className="block text-sm">
                  <span className="text-[var(--text-muted)]">Level</span>
                  <select
                    value={sessionLevel}
                    onChange={(e) => setSessionLevel(e.target.value as SessionLevelValue)}
                    className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  >
                    {SESSION_LEVEL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {!isMeditationMode && (
                  <label className="block text-sm">
                    <span className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Calendar className="h-3.5 w-3.5 text-[var(--accent)]" />
                      Scheduled at
                    </span>
                    <input
                      type="datetime-local"
                      required
                      value={scheduledLocal}
                      onChange={(e) => setScheduledLocal(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                    />
                  </label>
                )}
                <label className="block text-sm">
                  <span className="text-[var(--text-muted)]">Price (EUR)</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    required
                    value={priceEuros}
                    onChange={(e) => setPriceEuros(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4 border-t border-[var(--border)] pt-8">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <ImageIcon className="h-4 w-4 text-[var(--accent-warm)]" />
                Cover image
              </h3>
              <div
                onDragEnter={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                className={cn(
                  'relative rounded-2xl border-2 border-dashed px-4 py-10 text-center transition',
                  dragActive
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border)] bg-[var(--page-bg)]/40 hover:border-[var(--text-muted)]/50',
                )}
              >
                {imageUploading ? (
                  <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                    <p className="text-sm">Uploading to class-media…</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-10 w-10 text-[var(--text-muted)]" />
                    <p className="mt-3 text-sm text-[var(--text)]">
                      Drag &amp; drop an image here, or browse
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      JPEG, PNG, WebP, GIF · max 5 MB
                    </p>
                    <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent)]/10 px-5 py-2.5 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20">
                      Browse files
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={onFileInputChange}
                      />
                    </label>
                  </>
                )}
              </div>
              {imageError && <p className="text-sm text-red-400">{imageError}</p>}
              {imagePublicUrl && !imageUploading && (
                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--page-bg)]/60 p-4">
                  <img
                    src={imagePublicUrl}
                    alt=""
                    className="h-24 w-40 rounded-lg object-cover ring-1 ring-[var(--border)]"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)]">
                      <Check className="h-3.5 w-3.5" />
                      Public URL saved for this class
                    </p>
                    <p className="break-all text-xs text-[var(--text-muted)]">{imagePublicUrl}</p>
                    <button
                      type="button"
                      onClick={() => setImagePublicUrl(null)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              )}
            </section>

            {isMeditationMode ? (
              <AudioSanctuaryAdminSettings
                title={title}
                state={audioForm}
                onChange={(patch) => setAudioForm((prev) => ({ ...prev, ...patch }))}
              />
            ) : (
              <>
                <MuxStreamSettings
                  classId={effectiveId}
                  playbackId={muxPlaybackId}
                  streamKey={muxStreamKey}
                  muxStatus={muxStatus}
                  onUpdated={(next) => {
                    setMuxPlaybackId(next.mux_playback_id)
                    setMuxStreamKey(next.mux_stream_key)
                    setMuxStatus(next.mux_status)
                    if (next.video_url) setVideoUrl(next.video_url)
                  }}
                />

                <section className="space-y-4 border-t border-[var(--border)] pt-8">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                    <Video className="h-4 w-4 text-[var(--accent)]" />
                    Video URL
                  </h3>
                  <label className="block text-sm">
                    <span className="text-[var(--text-muted)]">
                      Playback / VOD URL (auto-filled when Mux stream is created)
                    </span>
                    <input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                      placeholder="https://stream.mux.com/…"
                    />
                  </label>
                </section>
              </>
            )}

            <section className="space-y-4 border-t border-[var(--border)] pt-8">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text)]">What to expect</h3>
                  {isMeditationMode && (
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      Use bullets for frequencies &amp; metadata (528Hz, theta beats, headphones, etc.)
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={addPoint}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:border-[var(--accent)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add bullet
                </button>
              </div>
              <div className="space-y-2">
                {points.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={p}
                      onChange={(e) => updatePoint(i, e.target.value)}
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                      placeholder={
                        isMeditationMode
                          ? 'e.g. 528Hz theta entrainment · Best with headphones'
                          : 'Bullet point for attendees'
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removePoint(i)}
                      disabled={points.length <= 1}
                      className="rounded-xl border border-[var(--border)] px-3 text-[var(--text-muted)] disabled:opacity-40 hover:border-red-500/40 hover:text-red-400"
                      aria-label="Remove bullet"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || imageUploading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] py-4 text-sm font-semibold text-[var(--on-accent)] shadow-lg shadow-[var(--accent)]/20 transition hover:opacity-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isMeditationMode ? 'Saving meditation…' : 'Saving class…'}
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  {isMeditationMode ? 'Save meditation' : 'Save class'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
