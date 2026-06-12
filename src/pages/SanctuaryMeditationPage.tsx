import { Loader2, PartyPopper } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { AudioSanctuaryPlayer } from '../components/audio/AudioSanctuaryPlayer'
import { SanctuaryMeditationMarketing } from '../components/audio/SanctuaryMeditationMarketing'
import { SanctuarySalesGate } from '../components/audio/SanctuarySalesGate'
import { CLASS_PUBLIC_SELECT } from '../lib/classSelect'
import { memberHasAudioAccess } from '../lib/audioAccess'
import { isGuidedMeditation } from '../lib/classKind'
import type { ClassDetails } from '../lib/classTypes'
import { fetchPrimaryBundleForClass, type SanctuaryBundleOffer } from '../lib/sanctuaryBundles'
import { supabase } from '../lib/supabase'
import { useAuth } from '../providers/AuthProvider'

export function SanctuaryMeditationPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [meditation, setMeditation] = useState<ClassDetails | null | undefined>(undefined)
  const [hasAccess, setHasAccess] = useState(false)
  const [bundleOffer, setBundleOffer] = useState<SanctuaryBundleOffer | null>(null)
  const [paymentSync, setPaymentSync] = useState(false)
  const [accessConfirmed, setAccessConfirmed] = useState(false)
  const accessLatchRef = useRef(false)
  const statusHandled = useRef(false)

  useEffect(() => {
    statusHandled.current = false
    setPaymentSync(false)
    setAccessConfirmed(false)
    accessLatchRef.current = false
  }, [slug])

  useEffect(() => {
    if (!slug) {
      setMeditation(null)
      return
    }
    let cancelled = false
    ;(async () => {
      const bySlug = await supabase
        .from('classes')
        .select(CLASS_PUBLIC_SELECT)
        .eq('slug', slug)
        .maybeSingle()

      if (cancelled) return

      let row = bySlug.data as ClassDetails | null
      if (!row) {
        const byId = await supabase
          .from('classes')
          .select(CLASS_PUBLIC_SELECT)
          .eq('id', slug)
          .maybeSingle()
        if (cancelled) return
        row = byId.data as ClassDetails | null
      }

      setMeditation(row ?? null)
      if (row?.id) {
        const bundle = await fetchPrimaryBundleForClass(row.id)
        if (!cancelled) setBundleOffer(bundle)
      } else if (!cancelled) {
        setBundleOffer(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  const refreshAccess = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !meditation?.id) {
      setHasAccess(false)
      return false
    }
    const ok = await memberHasAudioAccess(user.id, meditation.id)
    setHasAccess(ok)
    if (ok) accessLatchRef.current = true
    return ok
  }, [user?.id, meditation?.id])

  useEffect(() => {
    void refreshAccess()
  }, [refreshAccess])

  useEffect(() => {
    if (statusHandled.current) return
    if (searchParams.get('status') !== 'success') return
    statusHandled.current = true
    setPaymentSync(true)
  }, [searchParams])

  useEffect(() => {
    if (!paymentSync || !user?.id || !meditation?.id) return

    let cancelled = false
    let attempts = 0
    const poll = window.setInterval(() => {
      void (async () => {
        if (cancelled) return
        attempts += 1
        const ok = await memberHasAudioAccess(user.id, meditation.id)
        if (cancelled) return
        if (ok) {
          setHasAccess(true)
          setPaymentSync(false)
          setAccessConfirmed(true)
          const next = new URLSearchParams(searchParams)
          next.delete('status')
          next.delete('session_id')
          setSearchParams(next, { replace: true })
          window.setTimeout(() => setAccessConfirmed(false), 6000)
          window.clearInterval(poll)
          return
        }
        if (attempts >= 45) {
          setPaymentSync(false)
          const next = new URLSearchParams(searchParams)
          next.delete('status')
          next.delete('session_id')
          setSearchParams(next, { replace: true })
          window.clearInterval(poll)
        }
      })()
    }, 2000)

    void refreshAccess()

    return () => {
      cancelled = true
      window.clearInterval(poll)
    }
  }, [paymentSync, user?.id, meditation?.id, refreshAccess, searchParams, setSearchParams])

  if (meditation === undefined || authLoading) {
    return (
      <div className="-mx-4 -my-8 flex min-h-[60vh] items-center justify-center md:-mx-0">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)]" />
      </div>
    )
  }

  if (!meditation) {
    return <Navigate to="/sanctuary" replace />
  }

  if (!isGuidedMeditation(meditation)) {
    return <Navigate to={`/class/${meditation.slug ?? meditation.id}`} replace />
  }

  const showPlayer =
    user &&
    (hasAccess || accessLatchRef.current) &&
    meditation.sanctuary_status === 'active'

  return (
    <div className="-mx-4 -my-8 w-full min-w-0 md:-mx-0">
      {accessConfirmed && (
        <div
          className="fixed left-1/2 top-20 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--accent)]/50 bg-black/90 px-4 py-2 text-sm text-[var(--accent)] shadow-[0_0_24px_rgba(45,212,191,0.35)]"
          role="status"
        >
          <PartyPopper className="h-4 w-4" />
          Sanctuary unlocked — press play to begin
        </div>
      )}
      {paymentSync && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--accent)]" />
            <p className="mt-4 text-sm text-white/70">Confirming your unlock…</p>
          </div>
        </div>
      )}

      {showPlayer ? (
        <AudioSanctuaryPlayer meditation={meditation} />
      ) : user && !hasAccess ? (
        <SanctuarySalesGate meditation={meditation} bundleOffer={bundleOffer} />
      ) : (
        <SanctuaryMeditationMarketing meditation={meditation} />
      )}
    </div>
  )
}
