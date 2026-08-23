import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, mapUrlFor, formatDate } from '../store'
import TimePicker from '../components/TimePicker'

const emptyForm = { name: '', date: '', time: '7:00 PM', locationName: '', address: '', city: '', state: 'TX', zip: '' }

export default function ProposeMeet() {
  const { proposals, addProposal, supportProposal, members, profile, currentUserId, approvalThreshold } = useStore()
  const [form, setForm] = useState(emptyForm)
  const [submitted, setSubmitted] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value })

  const valid = form.name.trim() && form.date && form.time.trim() && form.locationName.trim()

  const memberName = (id: string) =>
    id === currentUserId ? profile.name : (members.find((m) => m.id === id)?.name ?? 'a member')

  const sorted = [...proposals].sort((a, b) => b.supporters.length - a.supporters.length)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Propose a Meet</h1>
        <p className="mt-1 text-gray-400">Anyone can suggest the next meet date — not just the organizer</p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-club-border bg-club-card p-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (valid) {
            addProposal({
              name: form.name.trim(),
              date: form.date,
              time: form.time.trim(),
              locationName: form.locationName.trim(),
              address: form.address.trim(),
              city: form.city.trim(),
              state: form.state.trim(),
              zip: form.zip.trim(),
            })
            setForm(emptyForm)
            setSubmitted(true)
          }
        }}
      >
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
        <button
          type="submit"
          disabled={!valid}
          className="w-full cursor-pointer rounded-xl bg-club-green py-2.5 font-semibold text-club-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          Propose Meet
        </button>
        {submitted && <p className="text-center text-sm text-club-green">✔ Proposal added! The group can now support it below.</p>}
      </form>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-club-green uppercase">📋 Proposed Meets</h2>
        <p className="text-xs text-gray-500">A proposal becomes an official meet on the calendar once {approvalThreshold} members support it.</p>
        {sorted.length === 0 && <p className="text-sm text-gray-400">No proposals yet. Be the first!</p>}
        {sorted.map((p) => {
          const iSupport = p.supporters.includes(currentUserId)
          const approved = Boolean(p.approvedMeetId)
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
              <div className="mt-3 flex gap-2">
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
