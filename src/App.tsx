import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import { StoreProvider, useStore } from './store'
import { AuthProvider, useAuth } from './auth'
import Layout from './components/Layout'
import Home from './pages/Home'
import Members from './pages/Members'
import Meets from './pages/Meets'
import MeetDetail from './pages/MeetDetail'
import History from './pages/History'
import Profile from './pages/Profile'
import Submit from './pages/Submit'
import Vote from './pages/Vote'
import ProposeMeet from './pages/ProposeMeet'
import Auth from './pages/Auth'

function CreateOrJoinGroup() {
  const { profile, createClub, joinClub } = useStore()
  const { signOut } = useAuth()
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submitCreate = async () => {
    if (!name.trim() || busy) return
    setBusy(true)
    setError('')
    const result = await createClub(name)
    if (!result) {
      setError('Could not create the group. Please try again.')
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
          <p className="text-gray-400">Name your group — you'll be its organizer and get a shareable invite code.</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitCreate()}
            placeholder="Group name"
            className="rounded-xl border border-club-border bg-club-card px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-club-green"
            autoFocus
          />
          <button
            onClick={submitCreate}
            disabled={!name.trim() || busy}
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
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && submitJoin()}
            placeholder="Group code (e.g. 4F7A2C)"
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
  const { session, loading, isConfigured } = useAuth()

  if (isConfigured && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-club-bg text-gray-400">
        Loading…
      </div>
    )
  }

  if (isConfigured && !session) return <Auth />

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
          <Route path="/submit" element={<Submit />} />
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
