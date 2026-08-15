import { useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore, daysUntil, formatDate, isPast, CURRENT_USER_ID } from '../store'
import Stars from '../components/Stars'

export default function MeetDetail() {
  const { id } = useParams()
  const { meets, members, profile, setRsvp, addReview, addChatMessage, addPhoto } = useStore()
  const meet = meets.find((m) => m.id === id)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [chatText, setChatText] = useState('')
  const photoRef = useRef<HTMLInputElement>(null)

  if (!meet) {
    return (
      <div className="py-16 text-center text-gray-400">
        Meet not found. <Link to="/" className="text-club-green underline">Back home</Link>
      </div>
    )
  }

  const memberById = (mid: string) =>
    mid === CURRENT_USER_ID
      ? { name: profile.name, avatar: profile.avatar }
      : (members.find((m) => m.id === mid) ?? { name: 'Member', avatar: '' })

  const past = isPast(meet.date)
  const days = daysUntil(meet.date)
  const myRsvp = meet.rsvps[CURRENT_USER_ID]
  const yes = Object.values(meet.rsvps).filter((r) => r === 'yes').length
  const no = Object.values(meet.rsvps).filter((r) => r === 'no').length
  const alreadyReviewed = meet.reviews.some((r) => r.memberId === CURRENT_USER_ID)

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-club-border bg-club-card">
        <img src={meet.photo} alt={meet.location} className="h-44 w-full object-cover" />
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">{meet.name}</h1>
              <p className="mt-1 text-gray-300">{meet.location}</p>
              <p className="text-sm text-gray-400">
                {meet.address && `${meet.address} · `}
                {meet.city}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-club-green-dark px-3 py-1 text-sm font-semibold text-club-green">
              {past ? 'Visited' : days === 0 ? 'Today!' : `${days} day${days === 1 ? '' : 's'} left`}
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-300">
            📅 {formatDate(meet.date)} · 🕖 {meet.time}
          </p>
          <p className="mt-1 text-sm">
            <span className="text-club-green">✔ {yes} Yes</span> · <span className="text-red-400">✖ {no} No</span>
          </p>
          {meet.mapUrl && (
            <a href={meet.mapUrl} target="_blank" rel="noreferrer" className="mt-3 block rounded-xl border border-club-border py-2.5 text-center font-semibold text-club-green hover:bg-club-card2">
              🗺️ View on Map
            </a>
          )}
          {!past && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-gray-300">Are you going?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setRsvp(meet.id, 'yes')}
                  className={`flex-1 cursor-pointer rounded-xl py-2.5 font-semibold ${myRsvp === 'yes' ? 'bg-club-green text-club-bg' : 'border border-club-border text-gray-300 hover:bg-club-card2'}`}
                >
                  ✔ Yes
                </button>
                <button
                  onClick={() => setRsvp(meet.id, 'no')}
                  className={`flex-1 cursor-pointer rounded-xl py-2.5 font-semibold ${myRsvp === 'no' ? 'bg-red-500 text-white' : 'border border-club-border text-gray-300 hover:bg-club-card2'}`}
                >
                  ✖ No
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-club-border bg-club-card p-4">
        <h2 className="text-xs font-bold tracking-widest text-club-green uppercase">📸 Photos</h2>
        {meet.photos.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {meet.photos.map((p, i) => (
              <img key={i} src={p} alt={`Photo ${i + 1}`} className="h-24 w-full rounded-lg object-cover" />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No photos yet.</p>
        )}
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => addPhoto(meet.id, reader.result as string)
            reader.readAsDataURL(file)
            e.target.value = ''
          }}
        />
        <button
          onClick={() => photoRef.current?.click()}
          className="mt-3 w-full cursor-pointer rounded-xl border border-club-border py-2 text-sm font-semibold text-club-green hover:bg-club-card2"
        >
          📷 Add Photo from your device
        </button>
      </section>

      <section className="rounded-2xl border border-club-border bg-club-card p-4">
        <h2 className="text-xs font-bold tracking-widest text-club-green uppercase">⭐ Reviews</h2>
        {meet.reviews.length > 0 && (
          <div className="mt-3 space-y-3">
            {meet.reviews.map((r) => {
              const m = memberById(r.memberId)
              return (
                <div key={r.id} className="rounded-xl bg-club-card2 p-3">
                  <div className="flex items-center gap-2">
                    <img src={m.avatar} alt={m.name} className="h-7 w-7 rounded-full bg-club-card" />
                    <span className="font-semibold">{m.name}</span>
                    <Stars rating={r.rating} />
                    <span className="ml-auto text-xs text-gray-500">{r.date}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-200">{r.comment}</p>
                </div>
              )
            })}
          </div>
        )}
        {meet.reviews.length === 0 && <p className="mt-2 text-sm text-gray-400">No reviews yet.</p>}
        {!alreadyReviewed && (
          <form
            className="mt-4 space-y-2 border-t border-club-border pt-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (rating > 0 && comment.trim()) {
                addReview(meet.id, rating, comment.trim())
                setRating(0)
                setComment('')
              }
            }}
          >
            <p className="text-sm font-semibold text-gray-300">Leave a review</p>
            <div className="flex items-center gap-2">
              <Stars rating={rating} size="lg" onRate={setRating} />
              {rating > 0 && <span className="text-sm font-semibold text-yellow-400">{rating}</span>}
            </div>
            <p className="text-xs text-gray-500">Tap the left half of a star for a half rating (e.g. 4.5)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={2}
              className="w-full rounded-xl border border-club-border bg-club-bg p-3 text-sm text-gray-100 placeholder-gray-500 focus:border-club-green focus:outline-none"
            />
            <button
              type="submit"
              disabled={rating === 0 || !comment.trim()}
              className="w-full cursor-pointer rounded-xl bg-club-green py-2.5 font-semibold text-club-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              Post Review
            </button>
          </form>
        )}
      </section>

      <section className="rounded-2xl border border-club-border bg-club-card p-4">
        <h2 className="text-xs font-bold tracking-widest text-club-green uppercase">💬 Group Chat</h2>
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
          {meet.chat.length === 0 && <p className="text-sm text-gray-400">No messages yet. Say hi!</p>}
          {meet.chat.map((c) => {
            const m = memberById(c.memberId)
            const mine = c.memberId === CURRENT_USER_ID
            return (
              <div key={c.id} className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                <img src={m.avatar} alt={m.name} className="h-6 w-6 rounded-full bg-club-card2" />
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-club-green-dark text-gray-100' : 'bg-club-card2 text-gray-200'}`}>
                  <p className="text-xs font-semibold text-club-green">{m.name}</p>
                  <p>{c.text}</p>
                  <p className="mt-0.5 text-right text-[10px] text-gray-500">{c.time}</p>
                </div>
              </div>
            )
          })}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (chatText.trim()) {
              addChatMessage(meet.id, chatText.trim())
              setChatText('')
            }
          }}
        >
          <input
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            placeholder="Message the group..."
            className="flex-1 rounded-xl border border-club-border bg-club-bg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-club-green focus:outline-none"
          />
          <button
            type="submit"
            disabled={!chatText.trim()}
            className="cursor-pointer rounded-xl bg-club-green px-4 font-semibold text-club-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </section>
    </div>
  )
}
