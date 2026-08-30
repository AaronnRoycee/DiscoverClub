import { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, isConfigured } from './lib/supabase'

interface AuthState {
  session: Session | null
  loading: boolean
  isConfigured: boolean
  authEvent: string | null
  signUp: (email: string, password: string, username: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  resetPassword: (email: string) => Promise<string | null>
  updatePassword: (password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function redirectTo() {
  return `${window.location.origin}${import.meta.env.BASE_URL}`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isConfigured)
  const [authEvent, setAuthEvent] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) console.error('[auth] getSession:', error.message)
        setSession(data?.session ?? null)
      })
      .catch((e) => console.error('[auth] getSession failed:', e))
      .finally(() => setLoading(false))
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      setAuthEvent(event)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, username: string) => {
    if (!supabase) return 'Backend not configured'
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, name: username }, emailRedirectTo: redirectTo() },
    })
    return error ? error.message : null
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) return 'Backend not configured'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  }

  const resetPassword = async (email: string) => {
    if (!supabase) return 'Backend not configured'
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectTo() })
    return error ? error.message : null
  }

  const updatePassword = async (password: string) => {
    if (!supabase) return 'Backend not configured'
    const { error } = await supabase.auth.updateUser({ password })
    return error ? error.message : null
  }

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, loading, isConfigured, authEvent, signUp, signIn, resetPassword, updatePassword, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
