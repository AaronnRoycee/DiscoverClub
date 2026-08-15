import { Link } from 'react-router-dom'
import { useStore, formatDate, isPast } from '../store'
import Stars from '../components/Stars'

export default function History() {
  const { meets } = useStore()
  const past = meets.filter((m) => isPast(m.date)).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="mt-1 text-gray-400">{past.length} previous discoveries</p>
      </div>
      <div className="space-y-3">
        {past.map((m) => {
          const avg = m.reviews.length
            ? m.reviews.reduce((a, r) => a + r.rating, 0) / m.reviews.length
            : null
          return (
            <Link key={m.id} to={`/meets/${m.id}`} className="flex items-center gap-4 rounded-2xl border border-club-border bg-club-card p-3 hover:bg-club-card2">
              <img src={m.photo} alt={m.location} className="h-20 w-28 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold">{m.location}</p>
                <p className="text-sm text-gray-400">Visited {formatDate(m.date)}</p>
                {avg !== null && (
                  <div className="mt-1 flex items-center gap-2">
                    <Stars rating={avg} />
                    <span className="text-sm text-gray-300">{avg.toFixed(1)} ({m.reviews.length} reviews)</span>
                  </div>
                )}
                {m.reviews[0] && <p className="mt-0.5 truncate text-sm text-gray-500">💬 "{m.reviews[0].comment}"</p>}
              </div>
              <span className="text-gray-500">›</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
