import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, mapUrlFor } from '../store'

const emptyForm = { name: '', address: '', city: '', state: 'TX', zip: '' }

export default function Submit() {
  const { submitLocation, hasSubmittedLocation, locationOptions } = useStore()
  const [form, setForm] = useState(emptyForm)
  const [done, setDone] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value })

  const valid = form.name.trim() && form.address.trim() && form.city.trim() && form.state.trim() && form.zip.trim()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Submit a Location</h1>
        <p className="mt-1 text-gray-400">Suggest the next spot for the club to discover</p>
      </div>

      {hasSubmittedLocation || done ? (
        <div className="rounded-2xl border border-club-border bg-club-card p-6 text-center">
          <p className="text-4xl">🎉</p>
          <p className="mt-2 text-lg font-semibold">Suggestion submitted!</p>
          <p className="mt-1 text-sm text-gray-400">Your location is now on the ballot.</p>
          <Link to="/vote" className="mt-4 inline-block rounded-xl bg-club-green px-6 py-2.5 font-semibold text-club-bg hover:brightness-110">
            Go Vote
          </Link>
        </div>
      ) : (
        <form
          className="space-y-4 rounded-2xl border border-club-border bg-club-card p-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (valid) {
              submitLocation({
                name: form.name.trim(),
                address: form.address.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                zip: form.zip.trim(),
              })
              setDone(true)
            }
          }}
        >
          <Field label="Location Name">
            <input value={form.name} onChange={set('name')} placeholder="e.g. Pecan Lodge" className={inputCls} />
          </Field>
          <Field label="Street Address">
            <input value={form.address} onChange={set('address')} placeholder="e.g. 2702 Main St" className={inputCls} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="City">
              <input value={form.city} onChange={set('city')} placeholder="Dallas" className={inputCls} />
            </Field>
            <Field label="State">
              <input value={form.state} onChange={set('state')} placeholder="TX" maxLength={2} className={inputCls} />
            </Field>
            <Field label="Zip Code">
              <input value={form.zip} onChange={set('zip')} placeholder="75226" inputMode="numeric" maxLength={10} className={inputCls} />
            </Field>
          </div>
          {valid && (
            <a
              href={mapUrlFor(form.name, form.address, form.city, form.state, form.zip)}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border border-club-border py-2 text-center text-sm font-semibold text-club-green hover:bg-club-card2"
            >
              🗺️ Preview on Map
            </a>
          )}
          <button
            type="submit"
            disabled={!valid}
            className="w-full cursor-pointer rounded-xl bg-club-green py-2.5 font-semibold text-club-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit Suggestion
          </button>
        </form>
      )}

      <section className="rounded-2xl border border-club-border bg-club-card p-4">
        <h2 className="text-xs font-bold tracking-widest text-club-green uppercase">Current Ballot</h2>
        <ul className="mt-3 space-y-2">
          {locationOptions.map((o) => (
            <li key={o.id} className="flex items-center justify-between rounded-xl bg-club-card2 px-3 py-2 text-sm">
              <div>
                <p className="font-semibold">{o.name}</p>
                <p className="text-xs text-gray-400">{o.address}, {o.city}, {o.state} {o.zip}</p>
              </div>
              <span className="shrink-0 text-gray-400">{o.votes.length} vote{o.votes.length === 1 ? '' : 's'}</span>
            </li>
          ))}
        </ul>
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
