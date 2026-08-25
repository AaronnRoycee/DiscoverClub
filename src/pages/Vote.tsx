import { Link } from 'react-router-dom'
import { useStore, mapUrlFor, formatDate } from '../store'

export default function Vote() {
  const { proposals, supportProposal, deleteProposal, members, profile, currentUserId, approvalThreshold } = useStore()

  const memberName = (id: string) =>
    id === currentUserId ? profile.name : (members.find((m) => m.id === id)?.name ?? 'a member')

  const myRole = members.find((m) => m.id === currentUserId)?.role
  const canManage = myRole === 'Organizer' || myRole === 'Admin'

  const sorted = [...proposals].sort((a, b) => b.supporters.length - a.supporters.length)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Vote for a Meet</h1>
        <p className="mt-1 text-gray-400">Support the location and date you want the group to do next.</p>
      </div>

      {sorted.length === 0 && (
        <div className="rounded-2xl border border-club-border bg-club-card p-5 text-center">
          <p className="text-gray-400">No open proposals yet.</p>
          <Link to="/propose" className="mt-3 inline-block rounded-xl bg-club-green px-4 py-2 text-sm font-semibold text-club-bg hover:brightness-110">
            Propose one
          </Link>
        </div>
      )}

      <section className="space-y-3">
        {sorted.map((p) => {
          const iSupport = p.supporters.includes(currentUserId)
          const approved = Boolean(p.approvedMeetId)
          const isSubmitter = p.proposedBy === currentUserId
          return (
            <div key={p.id} className={`rounded-2xl border p-4 ${approved || iSupport ? 'border-club-green bg-club-green-dark' : 'border-club-border bg-club-card'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-300">📅 {formatDate(p.date)} · 🕖 {p.time}</p>
                  <p className="text-sm text-gray-300">📍 {p.locationName}</p>
                  {p.address && (
                    <p className="text-sm text-gray-400">{p.address}{p.city && `, ${p.city}`}{p.state && `, ${p.state}`} {p.zip}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Proposed by {memberName(p.proposedBy)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold text-club-green">{p.supporters.length}<span className="text-sm text-gray-400">/{approvalThreshold}</span></p>
                  <p className="text-xs text-gray-400">in favor</p>
                </div>
              </div>
              {!approved && (
                <div className="mt-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-club-bg">
                    <div className="h-full rounded-full bg-club-green" style={{ width: `${Math.min(100, (p.supporters.length / approvalThreshold) * 100)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{approvalThreshold - p.supporters.length} more supporter{approvalThreshold - p.supporters.length === 1 ? '' : 's'} needed to make it official</p>
                </div>
              )}
              {approved && (
                <Link to={`/meets/${p.approvedMeetId}`} className="mt-3 block rounded-xl bg-club-green py-2 text-center text-sm font-bold text-club-bg hover:brightness-110">
                  ✔ Approved — view it on the calendar ›
                </Link>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {!approved && (
                  <button
                    onClick={() => supportProposal(p.id)}
                    className={`flex-1 cursor-pointer rounded-xl py-2 text-sm font-semibold ${
                      iSupport ? 'bg-club-green text-club-bg' : 'border border-club-border text-club-green hover:bg-club-card2'
                    }`}
                  >
                    {iSupport ? '✔ You support this — tap to withdraw' : '👍 Support this date'}
                  </button>
                )}
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
                {!approved && (isSubmitter || canManage) && (
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
    </div>
  )
}
