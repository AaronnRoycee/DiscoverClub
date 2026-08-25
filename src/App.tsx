import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import { StoreProvider, useStore } from './store'
import { AuthProvider, useAuth } from './auth'
import Layout from './components/Layout'
import Home from './pages/Home'
import Members from './pages/Members'
import Meets from './pages/Meets'
import MeetDetail from './pages/MeetDetail'
import History from './pages/History'
import Profile from './pages/Profile'
import Vote from './pages/Vote'
import ProposeMeet from './pages/ProposeMeet'
import Auth from './pages/Auth'

function ResetPassword() {
  const { updatePassword, signOut, authEvent } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6 || password !== confirm) return
    const err = await updatePassword(password)
    if (err) setError(err)
    else setSaved(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-club-bg px-4 text-gray-100">
      <div className="w-full max-w-sm rounded-2xl border border-club-border bg-club-card p-5">
        <h1 className="text-center text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-center text-sm text-gray-400">Password recovery event: {authEvent}</p>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">New password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">Confirm password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={6} required className={inputCls} />
          </div>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
          {saved && <p className="rounded-lg bg-club-green/10 px-3 py-2 text-sm text-club-green">Password updated. You can now use the app.</p>}
          <button type="submit" disabled={password !== confirm || password.length < 6} className="w-full cursor-pointer rounded-xl bg-club-green py-2.5 font-semibold text-club-bg hover:brightness-110 disabled:opacity-40">
            Update password
          </button>
        </form>
        <button onClick={() => signOut()} className="mt-4 w-full rounded-xl border border-club-border py-2 text-sm font-semibold text-gray-300 hover:bg-club-card2">
          Sign out instead
        </button>
      </div>
    </div>
  )
}

const inputCls =
  'mt-1 w-full rounded-xl border border-club-border bg-club-bg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-club-green focus:outline-none'

function CreateOrJoinGroup() {
  const { profile, createClub, joinClub } = useStore()
  const { signOut } = useAuth()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [groupName, setGroupName] = useState('')
  const [groupCode, setGroupCode] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const inviteCode = searchParams.get('code')
    if (inviteCode) {
      setCode(inviteCode)
      setMode('join')
    }
  }, [searchParams])

  const submitCreate = async () => {
    if (!groupName.trim() || !groupCode.trim() || busy) return
    setBusy(true)
    setError('')
    const result = await createClub(groupName, groupCode)
    if (!result) {
      setError('Could not create the group. The code may already be taken. Please try a different one.')
      setBusy(false)
    }
  }

  const submitJoin = async () => {
    if (!code.trim() || busy) return
    setBusy(true)
    setError('')
    const ok = await joinClub(code)
    if (!ok) {
      setError('No group found with that code. Double-check it and try again.')
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-club-bg px-6 text-center">
      <div className="text-5xl">🍽️</div>
      <h1 className="text-2xl font-bold text-white">Welcome, {profile.name}!</h1>
      {mode === 'choose' && (
        <>
          <p className="max-w-sm text-gray-400">Create your own discover club, or join a friend's with their group code.</p>
          <div className="flex w-full max-w-xs flex-col gap-3">
            <button
              onClick={() => setMode('create')}
              className="rounded-full bg-club-green px-5 py-3 font-semibold text-club-bg"
            >
              Create a group
            </button>
            <button
              onClick={() => setMode('join')}
              className="rounded-full border border-club-border px-5 py-3 font-semibold text-gray-200"
            >
              Join a group with a code
            </button>
          </div>
        </>
      )}
      {mode === 'create' && (
        <div className="flex w-full max-w-xs flex-col gap-3">
          <p className="text-gray-400">Name your group and choose a unique code to share with members.</p>
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitCreate()}
            placeholder="Group name"
            className="rounded-xl border border-club-border bg-club-card px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-club-green"
            autoFocus
          />
          <input
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitCreate()}
            placeholder="Group code (e.g. RoyceFam)"
            className="rounded-xl border border-club-border bg-club-card px-4 py-3 text-center font-mono tracking-widest text-white placeholder-gray-500 outline-none focus:border-club-green"
          />
          <button
            onClick={submitCreate}
            disabled={!groupName.trim() || !groupCode.trim() || busy}
            className="rounded-full bg-club-green px-5 py-3 font-semibold text-club-bg disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Create group'}
          </button>
          <button onClick={() => setMode('choose')} className="text-sm text-gray-400">
            Back
          </button>
        </div>
      )}
      {mode === 'join' && (
        <div className="flex w-full max-w-xs flex-col gap-3">
          <p className="text-gray-400">Enter the group code shared by the group's creator or an admin.</p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitJoin()}
            placeholder="Group code (e.g. RoyceFam)"
            className="rounded-xl border border-club-border bg-club-card px-4 py-3 text-center font-mono tracking-widest text-white placeholder-gray-500 outline-none focus:border-club-green"
            autoFocus
          />
          <button
            onClick={submitJoin}
            disabled={!code.trim() || busy}
            className="rounded-full bg-club-green px-5 py-3 font-semibold text-club-bg disabled:opacity-50"
          >
            {busy ? 'Joining…' : 'Join group'}
          </button>
          <button onClick={() => setMode('choose')} className="text-sm text-gray-400">
            Back
          </button>
        </div>
      )}
      {error && <p className="max-w-xs text-sm text-red-400">{error}</p>}
      <button
        onClick={signOut}
        className="mt-2 rounded-full border border-club-border px-5 py-2 text-sm font-semibold text-gray-300"
      >
        Sign out
      </button>
    </div>
  )
}

function MembershipGate({ children }: { children: ReactNode }) {
  const { isLive, membershipStatus, profile, club } = useStore()
  const { signOut } = useAuth()

  if (!isLive || membershipStatus === 'approved') return <>{children}</>

  if (membershipStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-club-bg text-gray-400">
        Loading…
      </div>
    )
  }

  if (membershipStatus === 'noclub') return <CreateOrJoinGroup />

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-club-bg px-6 text-center">
      <div className="text-5xl">🍽️</div>
      <h1 className="text-2xl font-bold text-white">Almost in, {profile.name}!</h1>
      <p className="max-w-sm text-gray-400">
        You've asked to join {club ? `“${club.name}”` : 'the group'} — its organizer has been notified and will
        approve your request. Check back soon!
      </p>
      <button
        onClick={signOut}
        className="mt-2 rounded-full border border-club-border px-5 py-2 text-sm font-semibold text-gray-300"
      >
        Sign out
      </button>
    </div>
  )
}

function Root() {
  const { session, loading, isConfigured, authEvent } = useAuth()

  if (isConfigured && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-club-bg text-gray-400">
        Loading…
      </div>
    )
  }

  if (isConfigured && !session) return <Auth />

  if (isConfigured && session && authEvent === 'PASSWORD_RECOVERY') {
    return <ResetPassword />
  }

  return (
    <StoreProvider key={session?.user.id ?? 'demo'}>
      <MembershipGate>
        <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/meets" element={<Meets />} />
          <Route path="/meets/:id" element={<MeetDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/propose" element={<ProposeMeet />} />
        </Route>
        </Routes>
      </MembershipGate>
    </StoreProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Root />
      </BrowserRouter>
    </AuthProvider>
  )
}
