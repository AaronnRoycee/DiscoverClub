import { useStore } from '../store'

export default function Members() {
  const { members } = useStore()
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Members</h1>
        <p className="mt-1 text-gray-400">{members.length} people in the club</p>
      </div>
      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-club-border bg-club-card p-4">
            <img src={m.avatar} alt={m.name} className="h-14 w-14 rounded-full bg-club-card2" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{m.name}</p>
                {m.role === 'Organizer' && (
                  <span className="rounded-full bg-club-green-dark px-2 py-0.5 text-xs font-semibold text-club-green">Organizer</span>
                )}
              </div>
              <p className="mt-0.5 truncate text-sm text-gray-400">{m.bio}</p>
              <p className="mt-0.5 text-xs text-gray-500">Joined {m.joined}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
