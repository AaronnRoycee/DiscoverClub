import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, formatDate, isPast, mapUrlFor } from '../store'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function Meets() {
  const { meets, proposals, supportProposal, deleteProposal, members, profile, currentUserId, approvalThreshold } = useStore()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const myRole = members.find((m) => m.id === currentUserId)?.role
  const canManage = myRole === 'Organizer' || myRole === 'Admin'

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
  const openProposals = proposals.filter((p) => !p.approvedMeetId).sort((a, b) => b.supporters.length - a.supporters.length)

  const memberName = (id: string) =>
    id === currentUserId ? profile.name : (members.find((m) => m.id === id)?.name ?? 'a member')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Meets</h1>
        <p className="mt-1 text-gray-400">Scheduled meets and open proposals</p>
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

      {openProposals.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold tracking-widest text-club-green uppercase">Proposed Meets</h2>
          {openProposals.map((p) => {
            const iSupport = p.supporters.includes(currentUserId)
            const isSubmitter = p.proposedBy === currentUserId
            return (
              <div key={p.id} className="rounded-2xl border border-club-border bg-club-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-gray-300">📅 {formatDate(p.date)} · 🕖 {p.time}</p>
                    <p className="text-sm text-gray-300">📍 {p.locationName}</p>
                    {p.address && (
                      <p className="text-sm text-gray-400">{p.address}{p.city && `, ${p.city}`}{p.state && `, ${p.state}`}{p.zip && ` ${p.zip}`}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Proposed by {memberName(p.proposedBy)} · {p.supporters.length}/{approvalThreshold} supporters</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Link to="/vote" className="text-xs font-semibold text-club-green hover:underline">
                      View ›
                    </Link>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-club-bg">
                    <div className="h-full rounded-full bg-club-green" style={{ width: `${Math.min(100, (p.supporters.length / approvalThreshold) * 100)}%` }} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => supportProposal(p.id)}
                    className={`flex-1 cursor-pointer rounded-xl py-2 text-sm font-semibold ${
                      iSupport ? 'bg-club-green text-club-bg' : 'border border-club-border text-club-green hover:bg-club-card2'
                    }`}
                  >
                    {iSupport ? '✔ Supported' : '👍 Support'}
                  </button>
                  {p.address && (
                    <a
                      href={mapUrlFor(p.locationName, p.address, p.city, p.state, p.zip)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-club-border px-4 py-2 text-sm font-semibold text-club-green hover:bg-club-card2"
                    >
                      🗺️ Map
                    </a>
                  )}
                  {(isSubmitter || canManage) && (
                    <button
                      onClick={() => deleteProposal(p.id)}
                      className="rounded-xl border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-400/10"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
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
        💡 Propose the next meet
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
