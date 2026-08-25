import { useState } from 'react'
import { useAuth } from '../auth'

type Mode = 'signin' | 'signup' | 'forgot'

export default function Auth() {
  const { signUp, signIn, resetPassword } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const isValid =
    email.includes('@') &&
    password.length >= 6 &&
    (mode !== 'signup' || (name.trim() && password === confirm)) &&
    (mode !== 'forgot' || true)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!isValid) return
    setBusy(true)
    let err: string | null = null
    if (mode === 'signin') err = await signIn(email, password)
    if (mode === 'signup') err = await signUp(email, password, name.trim())
    if (mode === 'forgot') err = await resetPassword(email)
    setBusy(false)
    if (err) {
      setError(err)
      return
    }
    if (mode === 'signup') {
      setMessage('Check your email to confirm your account, then sign in.')
      setMode('signin')
      setPassword('')
      setConfirm('')
    } else if (mode === 'forgot') {
      setMessage('If that email exists, a reset link has been sent.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-club-bg px-4 text-gray-100">
      <div className="w-full max-w-sm">
        <h1 className="text-center font-serif text-3xl font-bold italic">
          🍽️ Discover<span className="text-club-green">Club</span>
        </h1>
        <p className="mt-2 text-center text-sm text-gray-400">
          {mode === 'signin' && 'Sign in to your club.'}
          {mode === 'signup' && 'Create an account to start or join a club.'}
          {mode === 'forgot' && 'Reset your password.'}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-club-border bg-club-card p-5">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase">Your name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royce"
                required
                className={inputCls}
              />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className={inputCls}
              autoFocus={mode !== 'signup'}
            />
          </div>
          {mode !== 'forgot' && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className={inputCls}
              />
            </div>
          )}
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                required
                minLength={6}
                className={inputCls}
              />
            </div>
          )}

          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
          {message && <p className="rounded-lg bg-club-green/10 px-3 py-2 text-sm text-club-green">{message}</p>}

          <button
            type="submit"
            disabled={!isValid || busy}
            className="w-full cursor-pointer rounded-xl bg-club-green py-2.5 font-semibold text-club-bg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-400">
          {mode === 'signin' ? (
            <>
              <button onClick={() => { setMode('forgot'); setError(null); setMessage(null) }} className="text-club-green hover:underline">
                Forgot password?
              </button>
              <span className="mx-2">·</span>
              <button onClick={() => { setMode('signup'); setError(null); setMessage(null) }} className="text-club-green hover:underline">
                Create account
              </button>
            </>
          ) : (
            <button onClick={() => { setMode('signin'); setError(null); setMessage(null) }} className="text-club-green hover:underline">
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const inputCls =
  'mt-1 w-full rounded-xl border border-club-border bg-club-bg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-club-green focus:outline-none'
