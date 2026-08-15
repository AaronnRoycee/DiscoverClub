import { Link } from 'react-router-dom'
import { useStore, CURRENT_USER_ID } from '../store'

export default function Vote() {
  const { locationOptions, voteForLocation, members } = useStore()
  const myVote = locationOptions.find((o) => o.votes.includes(CURRENT_USER_ID))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Vote for Locations</h1>
        <p className="mt-1 text-gray-400">Pick your favorite for the Summer Kickoff</p>
      </div>

      <div className="space-y-3">
        {locationOptions.map((o) => {
          const isMine = o.votes.includes(CURRENT_USER_ID)
          const submitter = members.find((m) => m.id === o.submittedBy)
          return (
            <button
              key={o.id}
              onClick={() => voteForLocation(o.id)}
              className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border p-4 text-left ${
                isMine ? 'border-club-green bg-club-green-dark' : 'border-club-border bg-club-card hover:bg-club-card2'
              }`}
            >
              <div>
                <p className="font-semibold">{o.name}</p>
                <p className="text-sm text-gray-400">Suggested by {submitter?.name ?? 'a member'}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-club-green">{o.votes.length}</p>
                <p className="text-xs text-gray-400">vote{o.votes.length === 1 ? '' : 's'}</p>
                {isMine && <p className="text-xs font-semibold text-club-green">✔ Your vote</p>}
              </div>
            </button>
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
