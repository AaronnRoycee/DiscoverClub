import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './store'
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
    </StoreProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </AuthProvider>
  )
}
