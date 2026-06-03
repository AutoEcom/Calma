import { Check, Loader2, Lock, PartyPopper, Sparkles, Video } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ClassBadgesRow } from '../components/class/ClassBadges'
import { SessionCountdown } from '../components/class/SessionCountdown'
import { CLASS_PUBLIC_SELECT } from '../lib/classSelect'
import { fetchBookedCountsByClassIds, spotsRemaining } from '../lib/bookingCounts'
import { fetchUserAccessForClass, hasAccess } from '../lib/classAccess'
import { classDetailPath, isGuidedMeditation, sanctuaryDetailPath } from '../lib/classKind'
import type { ClassDetails } from '../lib/classTypes'
import { startCheckoutForClass } from '../lib/checkout'
import { formatEurFromCents } from '../lib/formatPrice'
import { supabase } from '../lib/supabase'
import { normalizeWhatToExpect } from '../lib/whatToExpect'
import { NeonPrimaryButton, NeonPrimaryLink } from '../components/ui/NeonGlow'
import { useAuth } from '../providers/AuthProvider'
import { badgeOnImageWarm, badgeOnImagePrice } from '../lib/solidBadge'
import { cn } from '../lib/utils'

export function ClassPage() {
  const { slug: routeSlug } = useParams<{ slug: string }>()
  const id = routeSlug
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  const [cls, setCls] = useState<ClassDetails | null | undefined>(undefined)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [accessRow, setAccessRow] = useState<Awaited<
    ReturnType<typeof fetchUserAccessForClass>
  > | null>(null)
  const [accessLoading, setAccessLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  /** Stripe return + webhook still writing */
  const [paymentCelebration, setPaymentCelebration] = useState(false)
  const [accessConfirmed, setAccessConfirmed] = useState(false)
  const [cancelNotice, setCancelNotice] = useState(false)
  const [bookedCount, setBookedCount] = useState<number | null>(null)
  const statusHandled = useRef(false)

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    if (statusHandled.current) return
    const status = searchParams.get('status')
    if (status === 'success') {
      statusHandled.current = true
      setPaymentCelebration(true)
      return
    }
    if (status === 'cancel') {
      statusHandled.current = true
      setCancelNotice(true)
      const next = new URLSearchParams(searchParams)
      next.delete('status')
      setSearchParams(next, { replace: true })
      window.setTimeout(() => setCancelNotice(false), 7000)
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!id) {
      setCls(null)
      return
    }
    let cancelled = false
    ;(async () => {
      let data = (
        await supabase
          .from('classes')
          .select(CLASS_PUBLIC_SELECT)
          .eq('slug', id)
          .maybeSingle()
      ).data as ClassDetails | null

      if (!data) {
        data = (
          await supabase
            .from('classes')
            .select(CLASS_PUBLIC_SELECT)
            .eq('id', id)
            .maybeSingle()
        ).data as ClassDetails | null
      }

      if (cancelled) return
      setLoadError(null)
      setCls(data ?? null)
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!cls?.id) {
      setBookedCount(null)
      return
    }
    let cancelled = false
    void (async () => {
      const m = await fetchBookedCountsByClassIds([cls.id])
      if (cancelled) return
      setBookedCount(m[cls.id] ?? 0)
    })()
    return () => {
      cancelled = true
    }
  }, [cls?.id])

  useEffect(() => {
    if (cls === undefined) return
    if (!user?.id || !cls?.id) {
      setAccessRow(null)
      setAccessLoading(false)
      return
    }
    let cancelled = false
    setAccessLoading(true)
    ;(async () => {
      const row = await fetchUserAccessForClass(user.id, cls.id)
      if (cancelled) return
      setAccessRow(row)
      setAccessLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id, cls])

  const userIdRef = useRef<string | undefined>(undefined)
  const classIdRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    userIdRef.current = user?.id
  }, [user?.id])
  useEffect(() => {
    classIdRef.current = cls?.id
  }, [cls?.id])

  const pollIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!paymentCelebration) return
    let cancelled = false
    let attempts = 0

    const clearPoll = () => {
      if (pollIntervalRef.current != null) {
        window.clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }

    const checkAccess = async () => {
      const memberId = userIdRef.current
      const classId = classIdRef.current
      if (!memberId || !classId || cancelled) return

      attempts += 1
      const row = await fetchUserAccessForClass(memberId, classId)
      if (cancelled) return

      setAccessRow(row)

      if (hasAccess(row)) {
        clearPoll()
        setPaymentCelebration(false)
        setAccessConfirmed(true)
        const next = new URLSearchParams(window.location.search)
        next.delete('status')
        next.delete('session_id')
        setSearchParams(next, { replace: true })
        window.setTimeout(() => setAccessConfirmed(false), 8000)
        return
      }

      if (attempts >= 45) {
        clearPoll()
        setPaymentCelebration(false)
        const next = new URLSearchParams(window.location.search)
        next.delete('status')
        next.delete('session_id')
        setSearchParams(next, { replace: true })
      }
    }

    pollIntervalRef.current = window.setInterval(() => void checkAccess(), 2000)
    void checkAccess()

    return () => {
      cancelled = true
      clearPoll()
    }
  }, [paymentCelebration, setSearchParams])

  const bullets = useMemo(
    () => normalizeWhatToExpect(cls?.what_to_expect),
    [cls?.what_to_expect],
  )

  const scheduledAt = cls ? new Date(cls.scheduled_at).getTime() : null
  const sessionStarted = scheduledAt != null && now >= scheduledAt
  const sessionPending = scheduledAt != null && now < scheduledAt
  const muxFinished =
    cls?.mux_status?.toLowerCase() === 'finished' && !!cls?.mux_recording_playback_id
  const userHasAccess = hasAccess(accessRow)

  const maxCapacity = cls
    ? typeof cls.max_capacity === 'number' && cls.max_capacity > 0
      ? cls.max_capacity
      : 20
    : 20
  const spotsLeft =
    bookedCount != null ? spotsRemaining(maxCapacity, bookedCount) : null
  const fullyBookedForPurchase =
    !userHasAccess && spotsLeft !== null && spotsLeft <= 0

  if (id === undefined) {
    return <p className="text-[var(--text-muted)]">Missing class slug.</p>
  }

  if (cls && isGuidedMeditation(cls)) {
    return <Navigate to={sanctuaryDetailPath(cls)} replace />
  }

  if (loadError) {
    return <p className="text-red-400">{loadError}</p>
  }

  if (cls === undefined) {
    return (
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
        Loading class…
      </div>
    )
  }

  if (cls === null) {
    return (
      <div className="space-y-2">
        <p className="text-[var(--text-muted)]">Class not found.</p>
        <Link to="/" className="text-[var(--accent)] hover:underline">
          Back home
        </Link>
      </div>
    )
  }

  const activeClass = cls

  async function onUnlock() {
    setCheckoutError(null)
    if (!user) {
      return
    }
    if (fullyBookedForPurchase) {
      setCheckoutError('This class is fully booked.')
      return
    }
    if (!activeClass.price_in_cents || activeClass.price_in_cents <= 0) {
      setCheckoutError('This session has no online price. Contact the studio.')
      return
    }
    setCheckoutLoading(true)
    const { url, error } = await startCheckoutForClass(activeClass.id)
    setCheckoutLoading(false)
    if (error) {
      setCheckoutError(error)
      return
    }
    if (url) {
      window.location.assign(url)
    }
  }

  const priceLabel =
    activeClass.price_in_cents > 0
      ? formatEurFromCents(activeClass.price_in_cents)
      : 'Included'

  return (
    <article className="space-y-10">
      {paymentCelebration && (
        <div
          className="relative overflow-hidden rounded-2xl border border-[var(--accent)]/40 px-5 py-5 shadow-[0_20px_60px_-30px_rgba(45,212,191,0.5)]"
          style={{
            background:
              'linear-gradient(135deg, rgba(45,212,191,0.15) 0%, rgba(245,158,11,0.08) 50%, rgba(15,23,42,0.9) 100%)',
          }}
        >
          <div className="flex flex-wrap items-start gap-3">
            <PartyPopper className="h-8 w-8 shrink-0 text-[var(--accent-warm)]" />
            <div>
              <p className="text-lg font-semibold text-[var(--text)]">Payment successful</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                We&apos;re confirming your access with the studio. This usually takes just a second…
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-[var(--accent)]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Syncing with Stripe webhook…
              </p>
            </div>
          </div>
        </div>
      )}
      {accessConfirmed && (
        <div className="rounded-xl border border-[var(--accent)]/60 bg-[var(--accent)]/15 px-4 py-3 text-sm font-medium text-[var(--text)]">
          You&apos;re in — your access is confirmed. Enjoy the session.
        </div>
      )}
      {cancelNotice && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
          Checkout was cancelled. You can unlock whenever you&apos;re ready.
        </div>
      )}
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="relative aspect-[16/9] bg-gradient-to-br from-[#0f172a] to-[#020617]">
              {activeClass.image_url ? (
                <img
                  src={activeClass.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                  CALMA
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                    Premium session
                  </p>
                  <h1 className="mt-1 text-3xl font-semibold leading-tight text-white drop-shadow">
                    {activeClass.title}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <ClassBadgesRow
                      sessionType={activeClass.session_type}
                      sessionLevel={activeClass.session_level}
                    />
                    {fullyBookedForPurchase && (
                      <span className={badgeOnImageWarm}>
                        Fully booked
                      </span>
                    )}
                  </div>
                </div>
                <span className={badgeOnImagePrice}>
                  {priceLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-[var(--text-muted)]">
            {spotsLeft !== null && (
              <p
                className={cn(
                  'text-sm font-medium',
                  spotsLeft <= 0 && !userHasAccess
                    ? 'text-amber-600 dark:text-amber-200/90'
                    : 'text-[var(--text)]',
                )}
              >
                {userHasAccess
                  ? `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left · you are registered`
                  : spotsLeft <= 0
                    ? 'Fully booked — no spots left.'
                    : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
              </p>
            )}
            <p>
              With <span className="text-[var(--text)]">{activeClass.instructor_name}</span> ·{' '}
              {new Date(activeClass.scheduled_at).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}{' '}
              · {activeClass.duration_minutes} min
            </p>
            {activeClass.description && (
              <p className="whitespace-pre-wrap text-[var(--text)]">{activeClass.description}</p>
            )}
          </div>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--accent-warm)]" />
              <h2 className="text-lg font-semibold text-[var(--text)]">What to expect</h2>
            </div>
            {bullets.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                Details for this session will be published soon.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {bullets.map((line) => (
                  <li key={line} className="flex gap-3 text-sm text-[var(--text)]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          {authLoading || accessLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--text-muted)]">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
              Checking access…
            </div>
          ) : userHasAccess ? (
            <div className="space-y-4">
              {muxFinished ? (
                <NeonPrimaryLink
                  to={`${classDetailPath(activeClass)}/live`}
                  className="flex w-full justify-stretch"
                >
                  <Video className="h-4 w-4" />
                  Watch recording
                </NeonPrimaryLink>
              ) : sessionPending ? (
                <SessionCountdown targetIso={activeClass.scheduled_at} />
              ) : sessionStarted ? (
                <NeonPrimaryLink
                  to={`${classDetailPath(activeClass)}/live`}
                  className="flex w-full justify-stretch"
                >
                  <Video className="h-4 w-4" />
                  Join live room
                </NeonPrimaryLink>
              ) : (
                <p className="text-center text-sm text-[var(--text-muted)]">
                  You&apos;re in. When the countdown ends, use{' '}
                  <strong className="text-[var(--text)]">Join live room</strong> to enter.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--surface)] to-[var(--page-bg)] p-6 shadow-[0_24px_60px_-40px_rgba(45,212,191,0.45)]">
              <div className="flex items-center gap-2 text-[var(--accent-warm)]">
                <Lock className="h-4 w-4" />
                <h2 className="text-lg font-semibold text-[var(--text)]">Unlock access</h2>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                Secure your spot for this session. After payment, your access is linked to this
                account.
              </p>
              {fullyBookedForPurchase && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-800 dark:text-amber-100">
                  This class has reached capacity. Join the waitlist by contacting the studio.
                </p>
              )}
              <div className="flex items-baseline justify-between rounded-xl border border-[var(--border)] bg-[var(--page-bg)]/60 px-4 py-3">
                <span className="text-sm text-[var(--text-muted)]">Today</span>
                <span className="text-2xl font-semibold text-[var(--text)]">{priceLabel}</span>
              </div>
              {checkoutError && (
                <p className="text-sm text-red-400">{checkoutError}</p>
              )}
              {!user ? (
                <div className="space-y-2">
                  <p className="text-sm text-[var(--text-muted)]">
                    Log in or create an account to continue to checkout.
                  </p>
                  <Link
                    to="/login"
                    state={{ from: classDetailPath(activeClass) }}
                    className="flex w-full items-center justify-center rounded-full border border-[var(--accent)] py-3 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/10"
                  >
                    Log in to unlock
                  </Link>
                </div>
              ) : (
                <NeonPrimaryButton
                  type="button"
                  onClick={() => void onUnlock()}
                  disabled={
                    checkoutLoading ||
                    activeClass.price_in_cents <= 0 ||
                    fullyBookedForPurchase
                  }
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting to Stripe…
                    </>
                  ) : activeClass.price_in_cents <= 0 ? (
                    'Contact studio for access'
                  ) : fullyBookedForPurchase ? (
                    'Fully booked'
                  ) : (
                    'Unlock with Stripe'
                  )}
                </NeonPrimaryButton>
              )}
            </div>
          )}
        </aside>
      </div>
    </article>
  )
}
