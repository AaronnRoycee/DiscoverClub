import { Link, useNavigate } from 'react-router-dom'
import { useStore, daysUntil, formatDate, isPast, CURRENT_USER_ID } from '../store'
import Stars from '../components/Stars'

export default function Home() {
  const { profile, meets, hasSubmittedLocation } = useStore()
  const navigate = useNavigate()

  const upcoming = meets.filter((m) => !isPast(m.date)).sort((a, b) => a.date.localeCompare(b.date))
  const nextMeet = upcoming[0]
  const past = meets.filter((m) => isPast(m.date)).sort((a, b) => b.date.localeCompare(a.date))
  const lastMeet = past[0]

  const actions: { id: string; icon: string; title: string; desc: string; cta: string; link: string }[] = []
  if (!hasSubmittedLocation)
    actions.push({ id: 'a1', icon: '❗', title: 'Submit a Location', desc: "You haven't submitted a suggestion yet.", cta: 'Submit Now', link: '/submit' })
  actions.push({ id: 'a2', icon: '🗳️', title: 'Vote for Locations', desc: 'Voting is open! Pick your favorite.', cta: 'Vote Now', link: '/vote' })
  if (nextMeet && nextMeet.rsvps[CURRENT_USER_ID] === 'pending')
    actions.push({ id: 'a3', icon: '📅', title: `RSVP to ${nextMeet.name}`, desc: 'Let the group know if you can make it.', cta: 'RSVP', link: `/meets/${nextMeet.id}` })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {profile.name}! 👋</h1>
        <p className="mt-1 text-gray-400">Here's your Home Hub</p>
      </div>

      {nextMeet && <NextMeetCard meetId={nextMeet.id} />}

      <section className="rounded-2xl border border-club-border bg-club-card p-4">
        <h2 className="text-xs font-bold tracking-widest text-club-green uppercase">⚡ Your Actions</h2>
        <div className="mt-3 space-y-3">
          {actions.length === 0 && <p className="text-sm text-gray-400">Nothing to do right now. You're all set! 🎉</p>}
          {actions.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-club-card2 p-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-gray-400">{a.desc}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(a.link)}
                className="shrink-0 cursor-pointer rounded-lg bg-club-green px-4 py-2 text-sm font-semibold text-club-bg hover:brightness-110"
              >
                {a.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {lastMeet && (
        <section className="rounded-2xl border border-club-border bg-club-card p-4">
          <h2 className="text-xs font-bold tracking-widest text-club-green uppercase">🧭 Last Discovery</h2>
          <Link to={`/meets/${lastMeet.id}`} className="mt-3 flex items-center gap-4 rounded-xl p-1 hover:bg-club-card2">
            <img src={lastMeet.photo} alt={lastMeet.location} className="h-20 w-28 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold">{lastMeet.location}</p>
              <p className="text-sm text-gray-400">Visited {formatDate(lastMeet.date)}</p>
              {lastMeet.reviews.length > 0 && (
                <div className="mt-1 flex items-center gap-2">
                  <Stars rating={Math.round(avgRating(lastMeet.reviews.map((r) => r.rating)))} />
                  <span className="text-sm text-gray-300">
                    {avgRating(lastMeet.reviews.map((r) => r.rating)).toFixed(1)} ({lastMeet.reviews.length} reviews)
                  </span>
                </div>
              )}
              {lastMeet.reviews[0] && (
                <p className="mt-1 truncate text-sm text-gray-400">💬 "{lastMeet.reviews[0].comment}"</p>
              )}
            </div>
            <span className="text-gray-500">›</span>
          </Link>
        </section>
      )}

      <Link
        to="/history"
        className="flex items-center justify-between rounded-2xl border border-club-border bg-club-card p-4 font-semibold hover:bg-club-card2"
      >
        View All Previous Discoveries <span className="text-gray-500">›</span>
      </Link>
    </div>
  )
}

function avgRating(ratings: number[]) {
  return ratings.reduce((a, b) => a + b, 0) / ratings.length
}

function NextMeetCard({ meetId }: { meetId: string }) {
  const { meets } = useStore()
  const meet = meets.find((m) => m.id === meetId)!
  const days = daysUntil(meet.date)
  const yes = Object.values(meet.rsvps).filter((r) => r === 'yes').length
  const no = Object.values(meet.rsvps).filter((r) => r === 'no').length
  const pending = Object.values(meet.rsvps).filter((r) => r === 'pending').length
  const total = Object.keys(meet.rsvps).length

  return (
    <section className="rounded-2xl border border-club-border bg-club-card p-4">
      <div className="flex items-start justify-between">
        <h2 className="text-xs font-bold tracking-widest text-club-green uppercase">📅 Next Meet</h2>
        <span className="rounded-full bg-club-green-dark px-3 py-1 text-sm font-semibold text-club-green">
          {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days} days left`}
        </span>
      </div>
      <Link to={`/meets/${meet.id}`} className="mt-2 block hover:opacity-90">
        <p className="text-2xl font-bold">{meet.name}</p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium">{formatDate(meet.date)}</p>
            </div>
            <div>
              <p className="text-gray-500">Time</p>
              <p className="font-medium">{meet.time}</p>
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium">{meet.location}</p>
              <p className="text-gray-400">{meet.city}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-club-green">
              <span className="text-3xl font-bold">{total}</span>
              <span className="text-xs text-gray-400">People</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-club-green">✔ {yes} Yes</span>
              <span className="text-red-400">✖ {no} No</span>
            </div>
            {pending > 0 && <span className="text-xs text-gray-500">{pending} Pending</span>}
          </div>
        </div>
      </Link>
      {meet.mapUrl && (
        <a
          href={meet.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block rounded-xl border border-club-border py-2.5 text-center font-semibold text-club-green hover:bg-club-card2"
        >
          🗺️ View on Map
        </a>
      )}
    </section>
  )
}
