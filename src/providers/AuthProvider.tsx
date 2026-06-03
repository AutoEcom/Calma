import type { Session, User } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import {
  fetchMember,
  roleFromMember,
  type AppRole,
  type MemberRow,
} from '../lib/member'

type AuthContextValue = {
  session: Session | null
  user: User | null
  member: MemberRow | null
  role: AppRole
  loading: boolean
  signOut: () => Promise<void>
  refreshMember: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

type Props = { children: ReactNode }

export function AuthProvider({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null)
  const [member, setMember] = useState<MemberRow | null>(null)
  const [loading, setLoading] = useState(true)

  const user = session?.user ?? null

  const refreshMember = useCallback(async () => {
    if (!user?.id) {
      setMember(null)
      return
    }
    const row = await fetchMember(user.id)
    setMember(row)
  }, [user?.id])

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (cancelled) return
      setSession(s)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setMember(null)
      return
    }
    void refreshMember()
  }, [user?.id, refreshMember])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setMember(null)
  }, [])

  const role = roleFromMember(member)

  const value = useMemo(
    () => ({
      session,
      user,
      member,
      role,
      loading,
      signOut,
      refreshMember,
    }),
    [session, user, member, role, loading, signOut, refreshMember],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
