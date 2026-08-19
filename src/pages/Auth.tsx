import { useState } from 'react'
import { useAuth } from '../auth'

export default function Auth() {
  const { signInAnonymous } = useAuth()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const err = await signInAnonymous(name.trim())
    if (err) setError(err)
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-club-bg px-4 text-gray-100">
      <div className="w-full max-w-sm">
        <h1 className="text-center font-serif text-3xl font-bold italic">
          🍽️ Discover<span className="text-club-green">Club</span>
        </h1>
        <p className="mt-2 text-center text-sm text-gray-400">Create your group or join one with a code.</p>

        <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-club-border bg-club-card p-5">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royce"
              required
              className={inputCls}
              autoFocus
            />
          </div>

          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full cursor-pointer rounded-xl bg-club-green py-2.5 font-semibold text-club-bg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Please wait…' : 'Get started'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">No email or password needed.</p>
      </div>
    </div>
  )
}

const inputCls =
  'mt-1 w-full rounded-xl border border-club-border bg-club-bg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-club-green focus:outline-none'
