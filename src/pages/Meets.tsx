import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, formatDate, isPast } from '../store'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function Meets() {
  const { meets } = useStore()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const meetsByDate = new Map(meets.map((m) => [m.date, m]))
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayIso = today.toISOString().slice(0, 10)

  const prev = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else setMonth((m) => m - 1)
  }
  const next = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else setMonth((m) => m + 1)
  }

  const monthMeets = meets
    .filter((m) => m.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
    .sort((a, b) => a.date.localeCompare(b.date))
  const upcoming = meets.filter((m) => !isPast(m.date)).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Meets</h1>
        <p className="mt-1 text-gray-400">Scheduled meets calendar</p>
      </div>

      <section className="rounded-2xl border border-club-border bg-club-card p-4">
        <div className="flex items-center justify-between">
          <button onClick={prev} className="cursor-pointer rounded-lg px-3 py-1 text-xl text-club-green hover:bg-club-card2" aria-label="Previous month">‹</button>
          <p className="font-semibold">{MONTHS[month]} {year}</p>
          <button onClick={next} className="cursor-pointer rounded-lg px-3 py-1 text-xl text-club-green hover:bg-club-card2" aria-label="Next month">›</button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
          {DOW.map((d, i) => (
            <span key={i} className="py-1">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDow }).map((_, i) => (
            <span key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const meet = meetsByDate.get(iso)
            const isToday = iso === todayIso
            const cell = (
              <span
                className={`flex h-10 flex-col items-center justify-center rounded-lg text-sm ${
                  meet
                    ? isPast(iso)
                      ? 'bg-club-green-dark font-semibold text-club-green'
                      : 'bg-club-green font-bold text-club-bg'
                    : isToday
                      ? 'border border-club-green text-club-green'
                      : 'text-gray-300'
                }`}
              >
                {day}
                {meet && <span className="text-[8px] leading-none">●</span>}
              </span>
            )
            return meet ? (
              <Link key={iso} to={`/meets/${meet.id}`} title={meet.location}>
                {cell}
              </Link>
            ) : (
              <span key={iso}>{cell}</span>
            )
          })}
        </div>
        <div className="mt-3 flex gap-4 text-xs text-gray-400">
          <span><span className="text-club-green">●</span> Past meet</span>
          <span><span className="rounded bg-club-green px-1 text-club-bg">●</span> Upcoming meet</span>
        </div>
      </section>

      {monthMeets.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold tracking-widest text-club-green uppercase">This Month</h2>
          {monthMeets.map((m) => (
            <MeetRow key={m.id} id={m.id} name={m.name} location={m.location} date={m.date} time={m.time} />
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-club-green uppercase">All Upcoming</h2>
        {upcoming.length === 0 && <p className="text-sm text-gray-400">No upcoming meets scheduled.</p>}
        {upcoming.map((m) => (
          <MeetRow key={m.id} id={m.id} name={m.name} location={m.location} date={m.date} time={m.time} />
        ))}
      </section>

      <Link to="/propose" className="block rounded-2xl border border-club-border bg-club-card p-4 text-center font-semibold text-club-green hover:bg-club-card2">
        💡 Propose the next meet date
      </Link>
    </div>
  )
}

function MeetRow({ id, name, location, date, time }: { id: string; name: string; location: string; date: string; time: string }) {
  return (
    <Link to={`/meets/${id}`} className="flex items-center justify-between rounded-2xl border border-club-border bg-club-card p-4 hover:bg-club-card2">
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-400">{location}</p>
        <p className="text-xs text-gray-500">{formatDate(date)} · {time}</p>
      </div>
      <span className="text-gray-500">›</span>
    </Link>
  )
}
