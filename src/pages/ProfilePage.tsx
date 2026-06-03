import {
  CreditCard,
  Loader2,
  Lock,
  LogOut,
  Settings2,
  Upload,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { ThemePreferenceSwitch } from '../components/ThemePreferenceSwitch'
import { NeonPrimaryButton } from '../components/ui/NeonGlow'
import { formatEurFromCents } from '../lib/formatPrice'
import { openStripeCustomerPortal } from '../lib/stripePortal'
import { supabase } from '../lib/supabase'
import { useAuth } from '../providers/AuthProvider'
import { calmaHeading, calmaMuted, zenFloat, zenInput, zenPanel } from '../lib/designSystem'
import { cn } from '../lib/utils'

type TabId = 'personal' | 'preferences' | 'security' | 'billing'

type TxRow = {
  id: string
  granted_at: string | null
  payment_method: string | null
  transaction_id: string | null
  classes: {
    id: string
    title: string
    price_in_cents: number
  } | null
}

export function ProfilePage() {
  const { user, member, loading, refreshMember, signOut } = useAuth()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<TabId>('personal')
  const [recoveryHint, setRecoveryHint] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [profileErr, setProfileErr] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdMsg, setPwdMsg] = useState<string | null>(null)
  const [pwdErr, setPwdErr] = useState<string | null>(null)

  const [transactions, setTransactions] = useState<TxRow[]>([])
  const [txLoading, setTxLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  useEffect(() => {
    if (member) {
      setFirstName(member.first_name ?? '')
      setLastName(member.last_name ?? '')
    }
  }, [member])

  useEffect(() => {
    if (searchParams.get('recovery') === '1') {
      setTab('security')
      setRecoveryHint(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (!user?.id) {
      setTransactions([])
      setTxLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setTxLoading(true)
      const { data, error } = await supabase
        .from('user_access')
        .select(
          `
          id,
          granted_at,
          payment_method,
          transaction_id,
          classes ( id, title, price_in_cents )
        `,
        )
        .eq('member_id', user.id)
        .not('access_granted', 'is', null)
        .order('granted_at', { ascending: false })
      if (cancelled) return
      if (!error && data) setTransactions(data as TxRow[])
      setTxLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.id) return
    setProfileErr(null)
    setProfileMsg(null)
    setSavingProfile(true)
    const { error } = await supabase
      .from('members')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      })
      .eq('id', user.id)
    setSavingProfile(false)
    if (error) {
      setProfileErr(error.message)
      return
    }
    setProfileMsg('Profile updated.')
    await refreshMember()
  }

  async function onAvatarFile(f: File | null) {
    if (!f || !user?.id) return
    if (f.size > 2 * 1024 * 1024) {
      setProfileErr('Avatar must be 2 MB or smaller.')
      return
    }
    setProfileErr(null)
    setAvatarUploading(true)
    const ext = f.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const safe = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg'
    const path = `${user.id}/avatar.${safe}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, f, {
      upsert: true,
      contentType: f.type || `image/${safe === 'jpg' ? 'jpeg' : safe}`,
    })
    if (upErr) {
      setAvatarUploading(false)
      setProfileErr(upErr.message)
      return
    }
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
    const { error: uErr } = await supabase
      .from('members')
      .update({ avatar_url: pub.publicUrl })
      .eq('id', user.id)
    setAvatarUploading(false)
    if (uErr) {
      setProfileErr(uErr.message)
      return
    }
    setProfileMsg('Photo updated.')
    await refreshMember()
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwdErr(null)
    setPwdMsg(null)
    if (newPassword.length < 6) {
      setPwdErr('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdErr('Passwords do not match.')
      return
    }
    setPwdLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwdLoading(false)
    if (error) {
      setPwdErr(error.message)
      return
    }
    setPwdMsg('Password updated.')
    setNewPassword('')
    setConfirmPassword('')
  }

  async function openPortal() {
    setPortalError(null)
    setPortalLoading(true)
    const { url, error } = await openStripeCustomerPortal()
    setPortalLoading(false)
    if (error) {
      setPortalError(error)
      return
    }
    if (url) window.location.assign(url)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-[var(--text-muted)]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)]" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: '/profile' }} />
  }

  const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings2 },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ]

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl">
      <h1 className={cn('text-3xl font-semibold', calmaHeading)}>Profile</h1>
      <p className={cn('mt-1 text-sm', calmaMuted)}>
        Manage your account, security, and purchase history.
      </p>

      <div className="relative mt-8 flex min-w-0 flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex min-w-0 shrink-0 flex-col lg:w-48">
          <nav className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium transition',
                  tab === t.id
                    ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                    : 'text-slate-600 hover:bg-white/50 dark:text-neutral-400 dark:hover:bg-white/[0.04]',
                )}
              >
                <t.icon className="h-4 w-4 shrink-0" />
                {t.label}
              </button>
            ))}
          </nav>
          <Link
            to="/dashboard"
            className="mt-2 hidden rounded-xl px-4 py-2 text-sm text-slate-600 hover:text-slate-900 lg:inline dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            ← Dashboard
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-4 inline-flex w-fit items-center gap-2 px-1 text-sm text-neutral-400 transition-colors hover:text-red-400 lg:mt-auto"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>

        <div className={cn('relative min-w-0 flex-1 p-5 sm:p-6 md:p-8', zenPanel)}>
          {tab === 'personal' && (
            <form onSubmit={saveProfile} className="space-y-6">
              <h2 className={cn('text-lg font-semibold', calmaHeading)}>Personal info</h2>
              <div className="flex flex-wrap items-center gap-6">
                {member?.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt=""
                    className="h-24 w-24 rounded-2xl object-cover shadow-md ring-1 ring-slate-200/60 dark:ring-white/[0.06]"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[var(--page-bg)] text-[var(--text-muted)]">
                    No photo
                  </div>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm shadow-sm ring-1 ring-slate-200/60 hover:ring-[var(--accent)]/35 dark:bg-neutral-900/50 dark:ring-white/[0.06]">
                  <Upload className="h-4 w-4" />
                  {avatarUploading ? 'Uploading…' : 'Change photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={avatarUploading}
                    onChange={(e) => void onAvatarFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)]">Email</label>
                <p className={cn('mt-1 px-4 py-3 text-sm', zenInput)}>
                  {user.email}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Email is managed by Supabase Auth. Contact support to change it.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-[var(--text-muted)]">First name</span>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={cn('mt-1 w-full', zenInput)}
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-[var(--text-muted)]">Last name</span>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={cn('mt-1 w-full', zenInput)}
                  />
                </label>
              </div>
              {profileErr && <p className="text-sm text-red-400">{profileErr}</p>}
              {profileMsg && <p className="text-sm text-[var(--accent)]">{profileMsg}</p>}
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-50"
              >
                {savingProfile ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          )}

          {tab === 'preferences' && (
            <div className="space-y-6">
              <h2 className={cn('text-lg font-semibold', calmaHeading)}>Preferences</h2>
              <p className={cn('text-sm', calmaMuted)}>
                Customize how Calma looks on your device.
              </p>
              <ThemePreferenceSwitch />
            </div>
          )}

          {tab === 'security' && (
            <form onSubmit={changePassword} className="space-y-6">
              <h2 className={cn('text-lg font-semibold', calmaHeading)}>Security</h2>
              {recoveryHint && (
                <p className="rounded-xl bg-[var(--accent)]/10 px-4 py-3 text-sm text-slate-900 ring-1 ring-[var(--accent)]/25 dark:text-neutral-100">
                  Choose a new password below to complete your reset.
                </p>
              )}
              <p className={cn('text-sm', calmaMuted)}>
                Update your password while logged in. Use a strong, unique passphrase.
              </p>
              <label className="block text-sm">
                <span className="text-[var(--text-muted)]">New password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={cn('mt-1 w-full', zenInput)}
                />
              </label>
              <label className="block text-sm">
                <span className="text-[var(--text-muted)]">Confirm password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn('mt-1 w-full', zenInput)}
                />
              </label>
              {pwdErr && <p className="text-sm text-red-400">{pwdErr}</p>}
              {pwdMsg && <p className="text-sm text-[var(--accent)]">{pwdMsg}</p>}
              <button
                type="submit"
                disabled={pwdLoading}
                className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-50"
              >
                {pwdLoading ? 'Updating…' : 'Change password'}
              </button>
            </form>
          )}

          {tab === 'billing' && (
            <div className="space-y-6">
              <h2 className={cn('text-lg font-semibold', calmaHeading)}>Billing</h2>
              <p className={cn('text-sm', calmaMuted)}>
                View class purchases and open the Stripe Customer Portal to manage payment methods
                and invoices.
              </p>
              <NeonPrimaryButton
                type="button"
                onClick={() => void openPortal()}
                disabled={portalLoading}
                className="max-w-md"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening Stripe…
                  </>
                ) : (
                  'Manage payment methods and invoices'
                )}
              </NeonPrimaryButton>
              {portalError && (
                <p className="text-sm text-red-400">{portalError}</p>
              )}

              <div>
                <h3 className={cn('text-sm font-medium', calmaHeading)}>Transaction history</h3>
                {txLoading ? (
                  <div className="mt-4 flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--text-muted)]">No purchases yet.</p>
                ) : (
                  <ul className={cn('mt-4 space-y-1 rounded-xl p-1', zenFloat)}>
                    {transactions.map((tx) => (
                      <li
                        key={tx.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm transition hover:bg-slate-100/60 dark:hover:bg-white/[0.03]"
                      >
                        <div>
                          <p className="font-medium text-[var(--text)]">
                            {tx.classes?.title ?? 'Class'}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {tx.granted_at
                              ? new Date(tx.granted_at).toLocaleString()
                              : '—'}{' '}
                            · {tx.payment_method ?? '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-[var(--text)]">
                            {tx.classes
                              ? formatEurFromCents(tx.classes.price_in_cents)
                              : '—'}
                          </p>
                          {tx.transaction_id && (
                            <p className="max-w-[200px] truncate text-[10px] text-[var(--text-muted)]">
                              {tx.transaction_id}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-8 inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-red-400 lg:hidden"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
