import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, mapUrlFor, type LocationOption } from '../store'

const inputCls =
  'w-full rounded-xl border border-club-border bg-club-bg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-club-green focus:outline-none'

export default function Vote() {
  const { locationOptions, voteForLocation, editLocation, members, currentUserId } = useStore()
  const myVote = locationOptions.find((o) => o.votes.includes(currentUserId))
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Vote for Locations</h1>
        <p className="mt-1 text-gray-400">Pick your favorite for the Summer Kickoff</p>
      </div>

      <div className="space-y-3">
        {locationOptions.map((o) => {
          const isVoted = o.votes.includes(currentUserId)
          const isSubmitter = o.submittedBy === currentUserId
          const submitter = members.find((m) => m.id === o.submittedBy)
          return editingId === o.id ? (
            <EditForm
              key={o.id}
              option={o}
              onSave={(loc) => {
                editLocation(o.id, loc)
                setEditingId(null)
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={o.id}
              role="button"
              tabIndex={0}
              onClick={() => voteForLocation(o.id)}
              onKeyDown={(e) => e.key === 'Enter' && voteForLocation(o.id)}
              className={`w-full cursor-pointer rounded-2xl border p-4 text-left ${
                isVoted ? 'border-club-green bg-club-green-dark' : 'border-club-border bg-club-card hover:bg-club-card2'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{o.name}</p>
                  <p className="text-sm text-gray-300">📍 {o.address}</p>
                  <p className="text-sm text-gray-400">{o.city}, {o.state} {o.zip}</p>
                  <p className="mt-1 text-xs text-gray-500">Suggested by {submitter?.name ?? 'a member'}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold text-club-green">{o.votes.length}</p>
                  <p className="text-xs text-gray-400">vote{o.votes.length === 1 ? '' : 's'}</p>
                  {isVoted && <p className="text-xs font-semibold text-club-green">✔ Your vote</p>}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href={mapUrlFor(o.name, o.address, o.city, o.state, o.zip)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 rounded-xl border border-club-border py-1.5 text-center text-sm font-semibold text-club-green hover:bg-club-card2"
                >
                  🗺️ View on Map
                </a>
                {isSubmitter && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingId(o.id)
                    }}
                    className="rounded-xl border border-club-border px-4 py-1.5 text-sm font-semibold text-gray-300 hover:bg-club-card2"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-sm text-gray-400">
        {myVote ? `You voted for ${myVote.name}. Tap another option to change your vote.` : 'Tap an option to cast your vote.'}
      </p>

      <Link to="/submit" className="block rounded-2xl border border-club-border bg-club-card p-4 text-center font-semibold text-club-green hover:bg-club-card2">
        + Suggest a different location
      </Link>
    </div>
  )
}

function EditForm({
  option,
  onSave,
  onCancel,
}: {
  option: LocationOption
  onSave: (loc: Omit<LocationOption, 'id' | 'submittedBy' | 'votes'>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: option.name,
    address: option.address,
    city: option.city,
    state: option.state,
    zip: option.zip,
  })
  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="rounded-2xl border border-club-border bg-club-card p-4">
      <p className="mb-3 font-semibold text-club-green">Edit suggestion</p>
      <div className="space-y-3">
        <input className={inputCls} value={form.name} onChange={update('name')} placeholder="Location name" />
        <input className={inputCls} value={form.address} onChange={update('address')} placeholder="Street address" />
        <div className="grid grid-cols-3 gap-2">
          <input className={inputCls} value={form.city} onChange={update('city')} placeholder="City" />
          <input className={inputCls} value={form.state} onChange={update('state')} placeholder="State" />
          <input className={inputCls} value={form.zip} onChange={update('zip')} placeholder="ZIP" />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onSave(form)}
          className="flex-1 rounded-lg bg-club-green py-2 text-sm font-semibold text-club-bg hover:brightness-110"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-club-border px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-club-card2"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
