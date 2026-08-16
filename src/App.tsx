import { BrowserRouter, Routes, Route } from 'react-router-dom'
import type { ReactNode } from 'react'
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

function MembershipGate({ children }: { children: ReactNode }) {
  const { isLive, membershipStatus, profile } = useStore()
  const { signOut } = useAuth()

  if (!isLive || membershipStatus === 'approved') return <>{children}</>

  if (membershipStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-club-bg text-gray-400">
        Loading…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-club-bg px-6 text-center">
      <div className="text-5xl">🍽️</div>
      <h1 className="text-2xl font-bold text-white">Almost in, {profile.name}!</h1>
      <p className="max-w-sm text-gray-400">
        Your account is created — you just need an invite. The club organizer has been notified and will approve
        your request. Check back soon!
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
