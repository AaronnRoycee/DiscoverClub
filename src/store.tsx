/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './auth'

export type Rsvp = 'yes' | 'no' | 'pending'

export interface Member {
  id: string
  name: string
  avatar: string
  role: 'Organizer' | 'Admin' | 'Member'
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
  address: string
  city: string
  state: string
  zip: string
  submittedBy: string
  votes: string[]
}

export interface MeetProposal {
  id: string
  name: string
  date: string
  time: string
  locationName: string
  address: string
  city: string
  state: string
  zip: string
  proposedBy: string
  supporters: string[]
  approvedMeetId?: string
}

export function mapUrlFor(name: string, address: string, city: string, state: string, zip: string): string {
  const query = [name, address, city, state, zip].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export interface Club {
  id: string
  name: string
  code: string
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

export const AVATARS = (seed: string) =>
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
      { id: 'r2', memberId: 'u3', rating: 4.5, comment: 'Loved the birria egg rolls. Long line though.', date: 'Apr 26, 2025' },
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
  { id: 'l1', name: 'Pecan Lodge', address: '2702 Main St', city: 'Dallas', state: 'TX', zip: '75226', submittedBy: 'u2', votes: ['u2', 'u3'] },
  { id: 'l2', name: 'Velvet Taco', address: '3012 N Henderson Ave', city: 'Dallas', state: 'TX', zip: '75206', submittedBy: 'u5', votes: ['u5'] },
  { id: 'l3', name: 'Meddlesome Moth', address: '1621 Oak Lawn Ave', city: 'Dallas', state: 'TX', zip: '75207', submittedBy: 'u7', votes: ['u7', 'u4', 'u6'] },
]

export const initialProposals: MeetProposal[] = [
  {
    id: 'p1',
    name: 'Sushi Sunday',
    date: daysFromNow(24),
    time: '6:30 PM',
    locationName: 'Sushi Marquee',
    address: '5880 State Hwy 121',
    city: 'Frisco',
    state: 'TX',
    zip: '75034',
    proposedBy: 'u3',
    supporters: ['u3', 'u5', 'u2', 'u7'],
  },
]

export const CURRENT_USER_ID = 'u1'

const emptyProfile = (id: string): Profile => ({
  id,
  name: '',
  username: '',
  avatar: AVATARS(id),
  bio: '',
  email: '',
  phone: '',
  city: '',
})

const demoProfile: Profile = {
  id: CURRENT_USER_ID,
  name: 'Aaron',
  username: 'aaron_r',
  avatar: AVATARS('Aaron'),
  bio: 'Founder of the food club. Always hunting the best brisket in DFW.',
  email: 'aaron@discoverclub.app',
  phone: '(214) 555-0132',
  city: 'Dallas, TX',
}

const fmtReviewDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const fmtChatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
const fmtJoined = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
const timeAgo = (iso: string) => {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

interface Store {
  profile: Profile
  setProfile: (p: Profile) => void
  currentUserId: string
  members: Member[]
  meets: Meet[]
  notifications: Notification[]
  markNotificationsRead: () => void
  locationOptions: LocationOption[]
  submitLocation: (loc: Omit<LocationOption, 'id' | 'submittedBy' | 'votes'>) => void
  hasSubmittedLocation: boolean
  voteForLocation: (id: string) => void
  setRsvp: (meetId: string, rsvp: Rsvp) => void
  addReview: (meetId: string, rating: number, comment: string) => void
  addChatMessage: (meetId: string, text: string) => void
  addPhoto: (meetId: string, dataUrl: string) => void
  proposals: MeetProposal[]
  addProposal: (p: Omit<MeetProposal, 'id' | 'proposedBy' | 'supporters'>) => void
  supportProposal: (id: string) => void
  approvalThreshold: number
  isLive: boolean
  membershipStatus: 'loading' | 'noclub' | 'pending' | 'approved'
  club: Club | null
  createClub: (name: string, code: string) => Promise<string | null>
  joinClub: (code: string) => Promise<boolean>
  pendingMembers: Member[]
  approveMember: (id: string) => void
  setMemberRole: (id: string, role: 'Admin' | 'Member') => void
}

const StoreContext = createContext<Store | null>(null)

const logError = (context: string) => (res: { error: { message: string } | null }) => {
  if (res.error) console.error(`[supabase] ${context}:`, res.error.message)
}

async function uploadDataUrl(userId: string, dataUrl: string): Promise<string | null> {
  if (!supabase) return null
  const blob = await (await fetch(dataUrl)).blob()
  const ext = blob.type.split('/')[1] ?? 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('photos').upload(path, blob, { contentType: blob.type })
  if (error) {
    console.error('[supabase] photo upload:', error.message)
    return null
  }
  return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const isLive = supabase !== null && session !== null
  const currentUserId = isLive ? session.user.id : CURRENT_USER_ID

  const [profile, setProfileState] = useState<Profile>(isLive ? emptyProfile(currentUserId) : demoProfile)
  const [members, setMembers] = useState<Member[]>(isLive ? [] : initialMembers)
  const [pendingMembers, setPendingMembers] = useState<Member[]>([])
  const [membershipStatus, setMembershipStatus] = useState<'loading' | 'noclub' | 'pending' | 'approved'>(isLive ? 'loading' : 'approved')
  const [club, setClub] = useState<Club | null>(isLive ? null : { id: 'demo', name: 'DiscoverClub', code: 'DEMO42' })
  const [meets, setMeets] = useState<Meet[]>(isLive ? [] : initialMeets)
  const [notifications, setNotifications] = useState<Notification[]>(isLive ? [] : initialNotifications)
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>(isLive ? [] : initialLocationOptions)
  const [proposals, setProposals] = useState<MeetProposal[]>(isLive ? [] : initialProposals)

  const approvalThreshold = isLive ? Math.max(2, Math.floor(members.length / 2) + 1) : 5

  const loadAll = useCallback(async () => {
    if (!supabase || !session) return
    const uid = session.user.id
    const [profilesRes, clubRes, meetsRes, rsvpsRes, reviewsRes, chatRes, photosRes, optionsRes, votesRes, proposalsRes, supportersRes, notifsRes] =
      await Promise.all([
        supabase.from('profiles').select('*').order('joined_at'),
        supabase.from('clubs').select('*').maybeSingle(),
        supabase.from('meets').select('*').order('date'),
        supabase.from('rsvps').select('*'),
        supabase.from('reviews').select('*').order('created_at'),
        supabase.from('chat_messages').select('*').order('created_at'),
        supabase.from('meet_photos').select('*').order('created_at'),
        supabase.from('location_options').select('*').order('created_at'),
        supabase.from('location_votes').select('*'),
        supabase.from('proposals').select('*').order('created_at'),
        supabase.from('proposal_supporters').select('*'),
        supabase.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      ])

    const profiles = profilesRes.data ?? []
    const toMember = (p: (typeof profiles)[number]): Member => ({
      id: p.id,
      name: p.name || p.username || 'Member',
      avatar: p.avatar_url || AVATARS(p.name || p.id),
      role: p.role === 'Organizer' || p.role === 'Admin' ? p.role : 'Member',
      joined: fmtJoined(p.joined_at),
      bio: p.bio ?? '',
    })
    setMembers(profiles.filter((p) => p.status === 'approved').map(toMember))
    setPendingMembers(profiles.filter((p) => p.status === 'pending').map(toMember))
    setClub(clubRes.data ? { id: clubRes.data.id, name: clubRes.data.name, code: clubRes.data.code } : null)
    const me = profiles.find((p) => p.id === uid)
    if (me) {
      setMembershipStatus(!me.club_id ? 'noclub' : me.status === 'approved' ? 'approved' : 'pending')
      setProfileState({
        id: me.id,
        name: me.name ?? '',
        username: me.username ?? '',
        avatar: me.avatar_url || AVATARS(me.name || me.id),
        bio: me.bio ?? '',
        email: me.email ?? '',
        phone: me.phone ?? '',
        city: me.city ?? '',
      })
    }

    const rsvps = rsvpsRes.data ?? []
    const reviews = reviewsRes.data ?? []
    const chat = chatRes.data ?? []
    const photos = photosRes.data ?? []
    setMeets(
      (meetsRes.data ?? []).map((m) => ({
        id: m.id,
        name: m.name,
        location: m.location,
        address: m.address ?? '',
        city: [m.city, m.state].filter(Boolean).join(', '),
        date: m.date,
        time: m.time,
        photo: m.photo_url || FOOD_IMG(m.id),
        mapUrl: m.address ? mapUrlFor(m.location, m.address, m.city, m.state, m.zip) : '',
        rsvps: Object.fromEntries(
          rsvps.filter((r) => r.meet_id === m.id).map((r): [string, Rsvp] => [r.user_id, r.status as Rsvp]),
        ),
        reviews: reviews
          .filter((r) => r.meet_id === m.id)
          .map((r) => ({ id: r.id, memberId: r.user_id, rating: Number(r.rating), comment: r.comment, date: fmtReviewDate(r.created_at) })),
        photos: photos.filter((p) => p.meet_id === m.id).map((p) => p.url),
        chat: chat
          .filter((c) => c.meet_id === m.id)
          .map((c) => ({ id: c.id, memberId: c.user_id, text: c.text, time: fmtChatTime(c.created_at) })),
      })),
    )

    const votes = votesRes.data ?? []
    setLocationOptions(
      (optionsRes.data ?? []).map((o) => ({
        id: o.id,
        name: o.name,
        address: o.address ?? '',
        city: o.city ?? '',
        state: o.state ?? '',
        zip: o.zip ?? '',
        submittedBy: o.submitted_by,
        votes: votes.filter((v) => v.option_id === o.id).map((v) => v.user_id),
      })),
    )

    const supporters = supportersRes.data ?? []
    setProposals(
      (proposalsRes.data ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        date: p.date,
        time: p.time,
        locationName: p.location_name,
        address: p.address ?? '',
        city: p.city ?? '',
        state: p.state ?? '',
        zip: p.zip ?? '',
        proposedBy: p.proposed_by,
        supporters: supporters.filter((s) => s.proposal_id === p.id).map((s) => s.user_id),
        approvedMeetId: p.approved_meet_id ?? undefined,
      })),
    )

    setNotifications(
      (notifsRes.data ?? []).map((n) => ({ id: n.id, text: n.text, time: timeAgo(n.created_at), link: n.link, read: n.read })),
    )
  }, [session])

  useEffect(() => {
    if (isLive) loadAll()
  }, [isLive, loadAll])

  const notifyOthers = (text: string, link: string) => {
    if (!supabase) return
    const rows = members
      .filter((m) => m.id !== currentUserId)
      .map((m) => ({ user_id: m.id, text, link }))
    if (rows.length > 0) supabase.from('notifications').insert(rows).then(logError('notify'))
  }

  const setProfile = (p: Profile) => {
    setProfileState(p)
    setMembers((ms) => ms.map((m) => (m.id === p.id ? { ...m, name: p.name, avatar: p.avatar, bio: p.bio } : m)))
    if (isLive && supabase) {
      const save = async () => {
        let avatarUrl = p.avatar
        if (avatarUrl.startsWith('data:')) {
          const uploaded = await uploadDataUrl(currentUserId, avatarUrl)
          if (uploaded) {
            avatarUrl = uploaded
            setProfileState((prev) => ({ ...prev, avatar: uploaded }))
            setMembers((ms) => ms.map((m) => (m.id === p.id ? { ...m, avatar: uploaded } : m)))
          }
        }
        supabase!
          .from('profiles')
          .update({ name: p.name, username: p.username, avatar_url: avatarUrl, bio: p.bio, email: p.email, phone: p.phone, city: p.city })
          .eq('id', currentUserId)
          .then(logError('update profile'))
      }
      save()
    }
  }

  const createClub = async (name: string, code: string): Promise<string | null> => {
    if (!isLive || !supabase) return null
    const { data, error } = await supabase.rpc('create_club', { p_name: name, p_code: code.trim().toUpperCase() })
    if (error) {
      console.error('[supabase] create club:', error.message)
      return null
    }
    await loadAll()
    return data as string
  }

  const joinClub = async (code: string): Promise<boolean> => {
    if (!isLive || !supabase) return false
    const { data, error } = await supabase.rpc('join_club', { p_code: code })
    if (error) {
      console.error('[supabase] join club:', error.message)
      return false
    }
    if (data) await loadAll()
    return !!data
  }

  const approveMember = (id: string) => {
    const m = pendingMembers.find((x) => x.id === id)
    if (!m) return
    setPendingMembers((ps) => ps.filter((x) => x.id !== id))
    setMembers((ms) => [...ms, m])
    if (isLive && supabase) {
      supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', id)
        .then((res) => {
          logError('approve member')(res)
          if (!res.error)
            supabase!
              .from('notifications')
              .insert({ user_id: id, text: `Welcome to DiscoverClub! ${profile.name} approved you.`, link: '/' })
              .then(logError('welcome notification'))
        })
    }
  }

  const setMemberRole = (id: string, role: 'Admin' | 'Member') => {
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, role } : m)))
    if (isLive && supabase) {
      supabase
        .from('profiles')
        .update({ role })
        .eq('id', id)
        .then((res) => {
          logError('set member role')(res)
          if (!res.error && role === 'Admin')
            supabase!
              .from('notifications')
              .insert({ user_id: id, text: `${profile.name} made you an Admin — you can now approve new members!`, link: '/members' })
              .then(logError('admin notification'))
        })
    }
  }

  const markNotificationsRead = () => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })))
    if (isLive && supabase)
      supabase.from('notifications').update({ read: true }).eq('user_id', currentUserId).then(logError('mark read'))
  }

  const hasSubmittedLocation = locationOptions.some((o) => o.submittedBy === currentUserId)

  const submitLocation = (loc: Omit<LocationOption, 'id' | 'submittedBy' | 'votes'>) => {
    const id = crypto.randomUUID()
    setLocationOptions((opts) => [...opts, { ...loc, id, submittedBy: currentUserId, votes: [currentUserId] }])
    if (isLive && supabase) {
      supabase
        .from('location_options')
        .insert({ id, name: loc.name, address: loc.address, city: loc.city, state: loc.state, zip: loc.zip, submitted_by: currentUserId })
        .then((res) => {
          logError('submit location')(res)
          if (!res.error) supabase!.from('location_votes').insert({ option_id: id, user_id: currentUserId }).then(logError('self vote'))
        })
      notifyOthers(`${profile.name} suggested ${loc.name} — vote now!`, '/vote')
    }
  }

  const voteForLocation = (id: string) => {
    const previous = locationOptions.find((o) => o.votes.includes(currentUserId))
    const target = locationOptions.find((o) => o.id === id)
    if (!target) return
    const isRemoving = previous?.id === id
    setLocationOptions((opts) =>
      opts.map((o) => {
        const votes = o.votes.filter((v) => v !== currentUserId)
        if (o.id === id && !isRemoving) votes.push(currentUserId)
        return { ...o, votes }
      }),
    )
    if (isLive && supabase) {
      const run = async () => {
        if (previous)
          await supabase!.from('location_votes').delete().eq('option_id', previous.id).eq('user_id', currentUserId)
        if (!isRemoving)
          await supabase!.from('location_votes').insert({ option_id: id, user_id: currentUserId })
      }
      run().catch((e) => console.error('[supabase] vote:', e))
    }
  }

  const setRsvp = (meetId: string, rsvp: Rsvp) => {
    setMeets((ms) => ms.map((m) => (m.id === meetId ? { ...m, rsvps: { ...m.rsvps, [currentUserId]: rsvp } } : m)))
    if (isLive && supabase)
      supabase.from('rsvps').upsert({ meet_id: meetId, user_id: currentUserId, status: rsvp }).then(logError('rsvp'))
  }

  const addReview = (meetId: string, rating: number, comment: string) => {
    const id = crypto.randomUUID()
    setMeets((ms) =>
      ms.map((m) =>
        m.id === meetId
          ? {
              ...m,
              reviews: [
                ...m.reviews,
                { id, memberId: currentUserId, rating, comment, date: fmtReviewDate(new Date().toISOString()) },
              ],
            }
          : m,
      ),
    )
    if (isLive && supabase)
      supabase.from('reviews').insert({ id, meet_id: meetId, user_id: currentUserId, rating, comment }).then(logError('review'))
  }

  const addChatMessage = (meetId: string, text: string) => {
    const id = crypto.randomUUID()
    setMeets((ms) =>
      ms.map((m) =>
        m.id === meetId
          ? { ...m, chat: [...m.chat, { id, memberId: currentUserId, text, time: fmtChatTime(new Date().toISOString()) }] }
          : m,
      ),
    )
    if (isLive && supabase)
      supabase.from('chat_messages').insert({ id, meet_id: meetId, user_id: currentUserId, text }).then(logError('chat'))
  }

  const addPhoto = (meetId: string, dataUrl: string) => {
    setMeets((ms) => ms.map((m) => (m.id === meetId ? { ...m, photos: [...m.photos, dataUrl] } : m)))
    if (isLive && supabase) {
      const run = async () => {
        const url = await uploadDataUrl(currentUserId, dataUrl)
        if (!url) return
        setMeets((ms) =>
          ms.map((m) => (m.id === meetId ? { ...m, photos: m.photos.map((p) => (p === dataUrl ? url : p)) } : m)),
        )
        supabase!.from('meet_photos').insert({ meet_id: meetId, user_id: currentUserId, url }).then(logError('photo'))
      }
      run()
    }
  }

  const addProposal = (p: Omit<MeetProposal, 'id' | 'proposedBy' | 'supporters'>) => {
    const id = crypto.randomUUID()
    setProposals((ps) => [...ps, { ...p, id, proposedBy: currentUserId, supporters: [currentUserId] }])
    if (isLive && supabase) {
      supabase
        .from('proposals')
        .insert({ id, name: p.name, date: p.date, time: p.time, location_name: p.locationName, address: p.address, city: p.city, state: p.state, zip: p.zip, proposed_by: currentUserId })
        .then((res) => {
          logError('proposal')(res)
          if (!res.error)
            supabase!.from('proposal_supporters').insert({ proposal_id: id, user_id: currentUserId }).then(logError('self support'))
        })
      notifyOthers(`${profile.name} proposed ${p.name} — support it!`, '/propose')
    }
  }

  const supportProposal = (id: string) => {
    const p = proposals.find((x) => x.id === id)
    if (!p || p.approvedMeetId) return
    const withdrawing = p.supporters.includes(currentUserId)
    const supporters = withdrawing
      ? p.supporters.filter((s) => s !== currentUserId)
      : [...p.supporters, currentUserId]

    if (supporters.length >= approvalThreshold) {
      const meetId = crypto.randomUUID()
      const memberIds = members.map((m) => m.id)
      const newMeet: Meet = {
        id: meetId,
        name: p.name,
        location: p.locationName,
        address: p.address,
        city: [p.city, p.state].filter(Boolean).join(', '),
        date: p.date,
        time: p.time,
        photo: FOOD_IMG(meetId),
        mapUrl: mapUrlFor(p.locationName, p.address, p.city, p.state, p.zip),
        rsvps: Object.fromEntries(memberIds.map((mid): [string, Rsvp] => [mid, supporters.includes(mid) ? 'yes' : 'pending'])),
        reviews: [],
        photos: [],
        chat: [],
      }
      setMeets((ms) => [...ms, newMeet])
      setProposals((ps) => ps.map((x) => (x.id === id ? { ...x, supporters, approvedMeetId: meetId } : x)))
      if (isLive && supabase) {
        const run = async () => {
          const { error: supportError } = await supabase!
            .from('proposal_supporters')
            .insert({ proposal_id: id, user_id: currentUserId })
          if (supportError) return console.error('[supabase] support:', supportError.message)
          const { error } = await supabase!.rpc('approve_proposal', {
            p_proposal_id: id,
            p_meet_id: meetId,
            p_photo_url: FOOD_IMG(meetId),
          })
          if (error) return console.error('[supabase] approve meet:', error.message)
          notifyOthers(`${p.name} is official — RSVP now!`, `/meets/${meetId}`)
          supabase!.functions
            .invoke('send-meet-alert', {
              body: {
                meetName: p.name,
                meetDate: formatDate(p.date),
                meetTime: p.time,
                meetLocation: [p.locationName, p.address, p.city, p.state].filter(Boolean).join(', '),
                meetLink: `${window.location.origin}/meets/${meetId}`,
              },
            })
            .catch((e: unknown) => console.warn('[supabase] email alert (function not deployed?):', e))
        }
        run()
      }
    } else {
      setProposals((ps) => ps.map((x) => (x.id === id ? { ...x, supporters } : x)))
      if (isLive && supabase) {
        if (withdrawing)
          supabase.from('proposal_supporters').delete().eq('proposal_id', id).eq('user_id', currentUserId).then(logError('withdraw'))
        else supabase.from('proposal_supporters').insert({ proposal_id: id, user_id: currentUserId }).then(logError('support'))
      }
    }
  }

  return (
    <StoreContext.Provider
      value={{
        profile,
        setProfile,
        currentUserId,
        members,
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
        proposals,
        addProposal,
        supportProposal,
        approvalThreshold,
        isLive,
        membershipStatus,
        club,
        createClub,
        joinClub,
        pendingMembers,
        approveMember,
        setMemberRole,
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
