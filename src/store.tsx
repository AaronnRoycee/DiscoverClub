/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'

export type Rsvp = 'yes' | 'no' | 'pending'

export interface Member {
  id: string
  name: string
  avatar: string
  role: 'Organizer' | 'Member'
  joined: string
  bio: string
}

export interface Review {
  id: string
  memberId: string
  rating: number
  comment: string
  date: string
}

export interface ChatMessage {
  id: string
  memberId: string
  text: string
  time: string
}

export interface Meet {
  id: string
  name: string
  location: string
  address: string
  city: string
  date: string // ISO date
  time: string
  photo: string
  mapUrl: string
  rsvps: Record<string, Rsvp>
  reviews: Review[]
  photos: string[]
  chat: ChatMessage[]
}

export interface Notification {
  id: string
  text: string
  time: string
  link: string
  read: boolean
}

export interface LocationOption {
  id: string
  name: string
  submittedBy: string
  votes: string[]
}

export interface Profile {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  email: string
  phone: string
  city: string
}

const daysFromNow = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const AVATARS = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=1e3a1e`

export const initialMembers: Member[] = [
  { id: 'u1', name: 'Aaron', avatar: AVATARS('Aaron'), role: 'Organizer', joined: 'Jan 2025', bio: 'Founder of the food club. Always hunting the best brisket in DFW.' },
  { id: 'u2', name: 'Mike', avatar: AVATARS('Mike'), role: 'Member', joined: 'Jan 2025', bio: 'BBQ enthusiast and hot sauce collector.' },
  { id: 'u3', name: 'Sarah', avatar: AVATARS('Sarah'), role: 'Member', joined: 'Feb 2025', bio: 'Dessert-first believer. Will drive anywhere for good tacos.' },
  { id: 'u4', name: 'James', avatar: AVATARS('James'), role: 'Member', joined: 'Feb 2025', bio: 'Coffee snob, pizza purist.' },
  { id: 'u5', name: 'Emily', avatar: AVATARS('Emily'), role: 'Member', joined: 'Mar 2025', bio: 'Foodie photographer. Check my shots on the meet pages!' },
  { id: 'u6', name: 'Chris', avatar: AVATARS('Chris'), role: 'Member', joined: 'Mar 2025', bio: 'Down for anything spicy.' },
  { id: 'u7', name: 'Dana', avatar: AVATARS('Dana'), role: 'Member', joined: 'Apr 2025', bio: 'Vegetarian scout — always finds a spot everyone loves.' },
  { id: 'u8', name: 'Luis', avatar: AVATARS('Luis'), role: 'Member', joined: 'Apr 2025', bio: 'Weekend griller, weekday snacker.' },
]

const FOOD_IMG = (id: string) => `https://picsum.photos/seed/${id}/640/400`

export const initialMeets: Meet[] = [
  {
    id: 'm1',
    name: 'Friday Food Club',
    location: 'Cane Rosso',
    address: '2612 Commerce St',
    city: 'Dallas, TX',
    date: daysFromNow(3),
    time: '7:00 PM',
    photo: FOOD_IMG('canerosso'),
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Cane+Rosso+Dallas+TX',
    rsvps: { u1: 'pending', u2: 'yes', u3: 'yes', u4: 'yes', u5: 'yes', u6: 'yes', u7: 'yes', u8: 'no' },
    reviews: [],
    photos: [],
    chat: [
      { id: 'c1', memberId: 'u2', text: 'Heard their margherita is unreal 🍕', time: '2:14 PM' },
      { id: 'c2', memberId: 'u3', text: 'I can grab a big table if we get there by 6:45', time: '2:31 PM' },
      { id: 'c3', memberId: 'u5', text: 'Bringing the camera for this one 📸', time: '3:02 PM' },
    ],
  },
  {
    id: 'm2',
    name: 'BBQ Saturday',
    location: 'Hurtado BBQ',
    address: '205 E Front St',
    city: 'Arlington, TX',
    date: daysFromNow(-20),
    time: '12:00 PM',
    photo: FOOD_IMG('hurtado'),
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Hurtado+BBQ+Arlington+TX',
    rsvps: { u1: 'yes', u2: 'yes', u3: 'yes', u4: 'no', u5: 'yes', u6: 'yes', u7: 'no', u8: 'yes' },
    reviews: [
      { id: 'r1', memberId: 'u2', rating: 5, comment: 'Great brisket and vibes!', date: 'Apr 26, 2025' },
      { id: 'r2', memberId: 'u3', rating: 4, comment: 'Loved the birria egg rolls. Long line though.', date: 'Apr 26, 2025' },
      { id: 'r3', memberId: 'u5', rating: 5, comment: 'Top 3 BBQ in DFW easily.', date: 'Apr 27, 2025' },
      { id: 'r4', memberId: 'u6', rating: 4, comment: 'Solid. Would come back for the turkey.', date: 'Apr 27, 2025' },
    ],
    photos: [FOOD_IMG('bbq1'), FOOD_IMG('bbq2'), FOOD_IMG('bbq3')],
    chat: [
      { id: 'c4', memberId: 'u1', text: 'That was an all-timer. Same time next month?', time: '3:40 PM' },
      { id: 'c5', memberId: 'u8', text: '100%. I am still full.', time: '4:02 PM' },
    ],
  },
  {
    id: 'm3',
    name: 'Taco Tuesday',
    location: 'Trompo',
    address: '839 Singleton Blvd',
    city: 'Dallas, TX',
    date: daysFromNow(-48),
    time: '6:30 PM',
    photo: FOOD_IMG('trompo'),
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Trompo+Dallas+TX',
    rsvps: { u1: 'yes', u2: 'no', u3: 'yes', u4: 'yes', u5: 'yes', u6: 'no', u7: 'yes', u8: 'yes' },
    reviews: [
      { id: 'r5', memberId: 'u4', rating: 5, comment: 'Trompo tacos are elite.', date: 'Mar 29, 2025' },
      { id: 'r6', memberId: 'u7', rating: 4, comment: 'Great veggie options too!', date: 'Mar 29, 2025' },
    ],
    photos: [FOOD_IMG('taco1'), FOOD_IMG('taco2')],
    chat: [],
  },
  {
    id: 'm4',
    name: 'Ramen Night',
    location: 'Salaryman',
    address: '2822 Greenville Ave',
    city: 'Dallas, TX',
    date: daysFromNow(-76),
    time: '7:30 PM',
    photo: FOOD_IMG('ramen'),
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Salaryman+Dallas+TX',
    rsvps: { u1: 'yes', u2: 'yes', u3: 'no', u4: 'yes', u5: 'no', u6: 'yes', u7: 'yes', u8: 'no' },
    reviews: [
      { id: 'r7', memberId: 'u1', rating: 5, comment: 'Best broth I have had outside of Japan.', date: 'Mar 1, 2025' },
      { id: 'r8', memberId: 'u6', rating: 3, comment: 'Good but pricey for the portion.', date: 'Mar 2, 2025' },
    ],
    photos: [FOOD_IMG('ramen1')],
    chat: [],
  },
  {
    id: 'm5',
    name: 'Summer Kickoff',
    location: 'TBD — vote below!',
    address: '',
    city: 'Dallas, TX',
    date: daysFromNow(17),
    time: '6:00 PM',
    photo: FOOD_IMG('summer'),
    mapUrl: '',
    rsvps: { u1: 'pending', u2: 'pending', u3: 'yes', u4: 'pending', u5: 'yes', u6: 'pending', u7: 'pending', u8: 'pending' },
    reviews: [],
    photos: [],
    chat: [],
  },
]

export const initialNotifications: Notification[] = [
  { id: 'n1', text: 'Voting is open for the Summer Kickoff location', time: '2h ago', link: '/vote', read: false },
  { id: 'n2', text: 'Mike commented on BBQ Saturday', time: '1d ago', link: '/meets/m2', read: false },
  { id: 'n3', text: 'Friday Food Club is in 3 days — RSVP now', time: '2d ago', link: '/meets/m1', read: true },
]

export const initialLocationOptions: LocationOption[] = [
  { id: 'l1', name: 'Pecan Lodge', submittedBy: 'u2', votes: ['u2', 'u3'] },
  { id: 'l2', name: 'Velvet Taco', submittedBy: 'u5', votes: ['u5'] },
  { id: 'l3', name: 'Meddlesome Moth', submittedBy: 'u7', votes: ['u7', 'u4', 'u6'] },
]

export const CURRENT_USER_ID = 'u1'

interface Store {
  profile: Profile
  setProfile: (p: Profile) => void
  members: Member[]
  meets: Meet[]
  notifications: Notification[]
  markNotificationsRead: () => void
  locationOptions: LocationOption[]
  submitLocation: (name: string) => void
  hasSubmittedLocation: boolean
  voteForLocation: (id: string) => void
  setRsvp: (meetId: string, rsvp: Rsvp) => void
  addReview: (meetId: string, rating: number, comment: string) => void
  addChatMessage: (meetId: string, text: string) => void
  addPhoto: (meetId: string, url: string) => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>({
    id: CURRENT_USER_ID,
    name: 'Aaron',
    username: 'aaron_r',
    avatar: AVATARS('Aaron'),
    bio: 'Founder of the food club. Always hunting the best brisket in DFW.',
    email: 'aaron@discoverclub.app',
    phone: '(214) 555-0132',
    city: 'Dallas, TX',
  })
  const [meets, setMeets] = useState<Meet[]>(initialMeets)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>(initialLocationOptions)
  const [hasSubmittedLocation, setHasSubmittedLocation] = useState(false)

  const markNotificationsRead = () =>
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })))

  const submitLocation = (name: string) => {
    setLocationOptions((opts) => [
      ...opts,
      { id: `l${Date.now()}`, name, submittedBy: CURRENT_USER_ID, votes: [CURRENT_USER_ID] },
    ])
    setHasSubmittedLocation(true)
  }

  const voteForLocation = (id: string) =>
    setLocationOptions((opts) =>
      opts.map((o) => {
        const votes = o.votes.filter((v) => v !== CURRENT_USER_ID)
        if (o.id === id && !o.votes.includes(CURRENT_USER_ID)) votes.push(CURRENT_USER_ID)
        return { ...o, votes }
      }),
    )

  const setRsvp = (meetId: string, rsvp: Rsvp) =>
    setMeets((ms) =>
      ms.map((m) => (m.id === meetId ? { ...m, rsvps: { ...m.rsvps, [CURRENT_USER_ID]: rsvp } } : m)),
    )

  const addReview = (meetId: string, rating: number, comment: string) =>
    setMeets((ms) =>
      ms.map((m) =>
        m.id === meetId
          ? {
              ...m,
              reviews: [
                ...m.reviews,
                {
                  id: `r${Date.now()}`,
                  memberId: CURRENT_USER_ID,
                  rating,
                  comment,
                  date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                },
              ],
            }
          : m,
      ),
    )

  const addChatMessage = (meetId: string, text: string) =>
    setMeets((ms) =>
      ms.map((m) =>
        m.id === meetId
          ? {
              ...m,
              chat: [
                ...m.chat,
                {
                  id: `c${Date.now()}`,
                  memberId: CURRENT_USER_ID,
                  text,
                  time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                },
              ],
            }
          : m,
      ),
    )

  const addPhoto = (meetId: string, url: string) =>
    setMeets((ms) => (ms.map((m) => (m.id === meetId ? { ...m, photos: [...m.photos, url] } : m))))

  return (
    <StoreContext.Provider
      value={{
        profile,
        setProfile,
        members: initialMembers,
        meets,
        notifications,
        markNotificationsRead,
        locationOptions,
        submitLocation,
        hasSubmittedLocation,
        voteForLocation,
        setRsvp,
        addReview,
        addChatMessage,
        addPhoto,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used within StoreProvider')
  return store
}

export function daysUntil(dateIso: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateIso + 'T00:00:00')
  return Math.round((target.getTime() - now.getTime()) / 86400000)
}

export function formatDate(dateIso: string): string {
  return new Date(dateIso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function isPast(dateIso: string): boolean {
  return daysUntil(dateIso) < 0
}
