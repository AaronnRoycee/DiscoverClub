import { useState } from 'react'
import { useStore } from '../store'

export default function Members() {
  const { members, pendingMembers, approveMember, setMemberRole, currentUserId, club, isLive } = useStore()
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const myRole = members.find((m) => m.id === currentUserId)?.role
  const isOrganizer = myRole === 'Organizer'
  const canApprove = isOrganizer || myRole === 'Admin'
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{club && isLive ? club.name : 'Members'}</h1>
        <p className="mt-1 text-gray-400">{members.length} people in the club</p>
      </div>
      {canApprove && club && isLive && (
        <div className="rounded-2xl border border-club-border bg-club-card p-4">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-300">Group invite code</p>
              <p className="mt-0.5 font-mono text-xl tracking-widest text-club-green">{club.code}</p>
              <p className="mt-0.5 text-xs text-gray-500">Share the code or the link below. You approve everyone who joins.</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(club.code)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="shrink-0 rounded-full border border-club-border px-3 py-1.5 text-xs font-semibold text-gray-300"
            >
              {copied ? 'Copied!' : 'Copy code'}
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <input
              readOnly
              value={`${window.location.origin}${import.meta.env.BASE_URL}?invite=${club.code}`}
              className="min-w-0 flex-1 truncate rounded-xl border border-club-border bg-club-bg px-3 py-2 text-sm text-gray-400"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}${import.meta.env.BASE_URL}?invite=${club.code}`)
                setLinkCopied(true)
                setTimeout(() => setLinkCopied(false), 2000)
              }}
              className="shrink-0 rounded-full bg-club-green px-3 py-2 text-xs font-semibold text-club-bg"
            >
              {linkCopied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      )}
      {canApprove && pendingMembers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-club-green">Waiting for approval</h2>
          {pendingMembers.map((m) => (
            <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-club-green/40 bg-club-card p-4">
              <img src={m.avatar} alt={m.name} className="h-14 w-14 rounded-full bg-club-card2" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{m.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">Requested to join · {m.joined}</p>
              </div>
              <button
                onClick={() => approveMember(m.id)}
                className="rounded-full bg-club-green px-4 py-2 text-sm font-semibold text-club-bg"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-club-border bg-club-card p-4">
            <img src={m.avatar} alt={m.name} className="h-14 w-14 rounded-full bg-club-card2" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{m.name}</p>
                {m.role !== 'Member' && (
                  <span className="rounded-full bg-club-green-dark px-2 py-0.5 text-xs font-semibold text-club-green">{m.role}</span>
                )}
              </div>
              <p className="mt-0.5 truncate text-sm text-gray-400">{m.bio}</p>
              <p className="mt-0.5 text-xs text-gray-500">Joined {m.joined}</p>
            </div>
            {isOrganizer && m.role !== 'Organizer' && (
              <button
                onClick={() => setMemberRole(m.id, m.role === 'Admin' ? 'Member' : 'Admin')}
                className="shrink-0 rounded-full border border-club-border px-3 py-1.5 text-xs font-semibold text-gray-300"
              >
                {m.role === 'Admin' ? 'Remove Admin' : 'Make Admin'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
