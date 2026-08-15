import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useStore } from '../store'

function BellIcon({ hasUnread }: { hasUnread: boolean }) {
  return (
    <span className="relative inline-block">
      <svg className="h-6 w-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      {hasUnread && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-club-green ring-2 ring-club-bg" />}
    </span>
  )
}

function NotificationsDropdown() {
  const { notifications, markNotificationsRead } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const hasUnread = notifications.some((n) => !n.read)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Notifications"
        className="cursor-pointer p-1"
        onClick={() => {
          setOpen((o) => !o)
          if (!open) markNotificationsRead()
        }}
      >
        <BellIcon hasUnread={hasUnread} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-club-border bg-club-card shadow-xl">
          <div className="border-b border-club-border px-4 py-2 text-sm font-semibold text-club-green">Notifications</div>
          {notifications.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">You're all caught up!</div>
          )}
          {notifications.map((n) => (
            <button
              key={n.id}
              className="block w-full cursor-pointer border-b border-club-border/50 px-4 py-3 text-left last:border-b-0 hover:bg-club-card2"
              onClick={() => {
                setOpen(false)
                navigate(n.link)
              }}
            >
              <p className="text-sm text-gray-100">{n.text}</p>
              <p className="mt-0.5 text-xs text-gray-500">{n.time}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const navItems = [
  { to: '/', label: 'Home', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75' },
  { to: '/members', label: 'Members', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
  { to: '/submit', label: 'Submit', icon: '' },
  { to: '/meets', label: 'Meets', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
  { to: '/history', label: 'History', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
]

export default function Layout() {
  const { profile } = useStore()
  return (
    <div className="min-h-screen bg-club-bg text-gray-100">
      <header className="sticky top-0 z-20 border-b border-club-border bg-club-green-dark/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-serif text-2xl font-bold italic tracking-tight text-gray-100">
            🍽️ Discover<span className="text-club-green">Club</span>
          </Link>
          <div className="flex items-center gap-3">
            <NotificationsDropdown />
            <Link to="/profile" aria-label="Profile">
              <img src={profile.avatar} alt={profile.name} className="h-9 w-9 rounded-full border border-club-border bg-club-card object-cover" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-5 pb-28">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-club-border bg-club-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-end justify-around px-2 pt-2 pb-2">
          {navItems.map((item) =>
            item.label === 'Submit' ? (
              <NavLink key={item.to} to={item.to} className="flex -mt-6 flex-col items-center gap-1">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-club-green text-3xl font-light text-club-bg shadow-lg shadow-club-green/30">
                  +
                </span>
                <span className="text-xs text-gray-400">Submit</span>
              </NavLink>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1 text-xs ${isActive ? 'text-club-green' : 'text-gray-400'}`
                }
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            ),
          )}
        </div>
      </nav>
    </div>
  )
}
