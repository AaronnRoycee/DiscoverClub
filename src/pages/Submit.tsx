import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'

export default function Submit() {
  const { submitLocation, hasSubmittedLocation, locationOptions } = useStore()
  const [name, setName] = useState('')
  const [done, setDone] = useState(false)

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
            if (name.trim()) {
              submitLocation(name.trim())
              setDone(true)
            }
          }}
        >
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase">Location Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pecan Lodge"
              className="mt-1 w-full rounded-xl border border-club-border bg-club-bg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-club-green focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
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
              <span>{o.name}</span>
              <span className="text-gray-400">{o.votes.length} vote{o.votes.length === 1 ? '' : 's'}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
