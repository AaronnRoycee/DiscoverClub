import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './store'
import Layout from './components/Layout'
import Home from './pages/Home'
import Members from './pages/Members'
import Meets from './pages/Meets'
import MeetDetail from './pages/MeetDetail'
import History from './pages/History'
import Profile from './pages/Profile'
import Submit from './pages/Submit'
import Vote from './pages/Vote'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
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
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
