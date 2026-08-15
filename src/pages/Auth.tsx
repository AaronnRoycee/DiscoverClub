import { useState } from 'react'
import { useAuth } from '../auth'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)
    if (mode === 'signup') {
      const err = await signUp(email.trim(), password, name.trim())
      if (err) setError(err)
      else setInfo('Check your email for a confirmation link, then log in!')
    } else {
      const err = await signIn(email.trim(), password)
      if (err) setError(err)
    }
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-club-bg px-4 text-gray-100">
      <div className="w-full max-w-sm">
        <h1 className="text-center font-serif text-3xl font-bold italic">
          🍽️ Discover<span className="text-club-green">Club</span>
        </h1>
        <p className="mt-2 text-center text-sm text-gray-400">
          {mode === 'login' ? 'Welcome back! Log in to your club.' : 'Create your account to join the club.'}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-club-border bg-club-card p-5">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className={inputCls} />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} className={inputCls} />
            {mode === 'signup' && <p className="mt-1 text-xs text-gray-500">At least 8 characters</p>}
          </div>

          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
          {info && <p className="rounded-lg bg-club-green-dark px-3 py-2 text-sm text-club-green">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full cursor-pointer rounded-xl bg-club-green py-2.5 font-semibold text-club-bg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError(null)
              setInfo(null)
            }}
            className="cursor-pointer font-semibold text-club-green hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}

const inputCls =
  'mt-1 w-full rounded-xl border border-club-border bg-club-bg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-club-green focus:outline-none'
