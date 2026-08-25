import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, mapUrlFor, formatDate } from '../store'
import TimePicker from '../components/TimePicker'

const emptyForm = { name: '', date: '', time: '7:00 PM', locationName: '', address: '', city: '', state: 'TX', zip: '' }

export default function ProposeMeet() {
  const { proposals, addProposal, editProposal, deleteProposal, supportProposal, members, profile, currentUserId, approvalThreshold } = useStore()
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value })

  const valid = form.name.trim() && form.date && form.time.trim() && form.locationName.trim()

  const memberName = (id: string) =>
    id === currentUserId ? profile.name : (members.find((m) => m.id === id)?.name ?? 'a member')

  const myRole = members.find((m) => m.id === currentUserId)?.role
  const canManage = myRole === 'Organizer' || myRole === 'Admin'

  const sorted = [...proposals].sort((a, b) => b.supporters.length - a.supporters.length)

  const startEdit = (p: (typeof proposals)[number]) => {
    setForm({
      name: p.name,
      date: p.date,
      time: p.time,
      locationName: p.locationName,
      address: p.address,
      city: p.city,
      state: p.state,
      zip: p.zip,
    })
    setEditingId(p.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    if (editingId) {
      editProposal(editingId, { ...form })
      setEditingId(null)
    } else {
      addProposal({ ...form })
      setSubmitted(true)
    }
    setForm(emptyForm)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Propose a Meet</h1>
        <p className="mt-1 text-gray-400">Suggest a location, date, and time for the group. Members vote to make it official.</p>
      </div>

      <form className="space-y-4 rounded-2xl border border-club-border bg-club-card p-4" onSubmit={handleSubmit}>
        <Field label="Meet Name">
          <input value={form.name} onChange={set('name')} placeholder="e.g. Taco Tuesday" className={inputCls} />
        </Field>
        <Field label="Date">
          <div className="relative">
            <input
              type="date"
              value={form.date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={set('date')}
              onFocus={(e) => {
                const input = e.currentTarget as HTMLInputElement & { showPicker?: () => void }
                if (input.showPicker) input.showPicker()
              }}
              className={`${inputCls} pl-10`}
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg">📅</span>
          </div>
        </Field>
        <Field label="Time">
          <div className="mt-1">
            <TimePicker value={form.time} onChange={(time) => setForm((f) => ({ ...f, time }))} />
          </div>
        </Field>
        <Field label="Location Name">
          <input value={form.locationName} onChange={set('locationName')} placeholder="e.g. Velvet Taco" className={inputCls} />
        </Field>
        <Field label="Street Address (optional)">
          <input value={form.address} onChange={set('address')} placeholder="e.g. 3012 N Henderson Ave" className={inputCls} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="City">
            <input value={form.city} onChange={set('city')} placeholder="Dallas" className={inputCls} />
          </Field>
          <Field label="State">
            <input value={form.state} onChange={set('state')} placeholder="TX" maxLength={2} className={inputCls} />
          </Field>
          <Field label="Zip Code">
            <input value={form.zip} onChange={set('zip')} placeholder="75206" inputMode="numeric" maxLength={10} className={inputCls} />
          </Field>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!valid}
            className="flex-1 cursor-pointer rounded-xl bg-club-green py-2.5 font-semibold text-club-bg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {editingId ? 'Save changes' : 'Propose Meet'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="rounded-xl border border-club-border px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-club-card2">
              Cancel
            </button>
          )}
        </div>
        {submitted && !editingId && <p className="text-center text-sm text-club-green">✔ Proposal added! The group can now support it below.</p>}
      </form>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-club-green uppercase">📋 Proposed Meets</h2>
        <p className="text-xs text-gray-500">A proposal becomes an official meet once {approvalThreshold} members support it.</p>
        {sorted.length === 0 && <p className="text-sm text-gray-400">No proposals yet. Be the first!</p>}
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
                {!approved && isSubmitter && (
                  <button onClick={() => startEdit(p)} className="rounded-xl border border-club-border px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-club-card2">
                    ✏️ Edit
                  </button>
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

const inputCls =
  'mt-1 w-full rounded-xl border border-club-border bg-club-bg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-club-green focus:outline-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 uppercase">{label}</label>
      {children}
    </div>
  )
}
