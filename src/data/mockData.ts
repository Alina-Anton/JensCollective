import { getUserCreatedEventById, getUserCreatedEvents } from '@/lib/userCreatedEvents'

export type EventCategory =
  | 'Strength'
  | 'Conditioning'
  | 'Mobility'
  | 'Workshop'
  | 'Social'

export type Coach = {
  name: string
  title: string
  initials: string
}

export type GymEvent = {
  id: string
  creatorUid?: string
  title: string
  description: string
  longDescription: string
  startsAt: string
  endsAt: string
  location: string
  host: Coach
  priceCents: number | null
  maxSpots: number
  reservedCount: number
  category: EventCategory
  waitlistEnabled: boolean
  imageHint: string
}

export type ActivityItem = {
  id: string
  user: string
  action: string
  target: string
  at: string
}

export type CommunityPost = {
  id: string
  authorUid?: string
  author: string
  initials: string
  role: 'Member' | 'Coach' | 'Admin'
  title: string
  body: string
  at: string
  likes: number
  comments: number
  pinned?: boolean
}

export type Reservation = {
  id: string
  eventId: string
  status: 'confirmed' | 'waitlist' | 'attended' | 'cancelled'
  payment: 'paid' | 'pending' | 'waived'
}

export const currentUser = {
  name: 'Jordan Ellis',
  email: 'jordan@example.com',
  initials: 'JE',
  avatarUrl: '',
  memberSince: '2023-09-12',
  tier: 'Founding member',
}

export const events: GymEvent[] = []

export const activityFeed: ActivityItem[] = []

export const communityPosts: CommunityPost[] = []

export const reservations: Reservation[] = []

export const trendingEventIds: string[] = []

export const activeMembers = [
  { name: 'Sam Rivera', initials: 'SR' },
  { name: 'Priya Shah', initials: 'PS' },
  { name: 'Leo Martin', initials: 'LM' },
  { name: 'Noah Patel', initials: 'NP' },
  { name: 'Avery Brooks', initials: 'AB' },
]

export const members = [
  { name: 'Jordan Ellis', initials: 'JE', avatarUrl: '' },
  { name: 'Sam Rivera', initials: 'SR', avatarUrl: '' },
  { name: 'Priya Shah', initials: 'PS', avatarUrl: '' },
  { name: 'Leo Martin', initials: 'LM', avatarUrl: '' },
  { name: 'Noah Patel', initials: 'NP', avatarUrl: '' },
  { name: 'Avery Brooks', initials: 'AB', avatarUrl: '' },
  { name: 'Mira Chen', initials: 'MC', avatarUrl: '' },
  { name: 'Alex Kim', initials: 'AK', avatarUrl: '' },
  { name: 'Maya Johnson', initials: 'MJ', avatarUrl: '' },
  { name: 'Chris Turner', initials: 'CT', avatarUrl: '' },
  { name: 'Daniel Park', initials: 'DP', avatarUrl: '' },
  { name: 'Emma Wilson', initials: 'EW', avatarUrl: '' },
  { name: 'Olivia Stone', initials: 'OS', avatarUrl: '' },
  { name: 'Nathan Cole', initials: 'NC', avatarUrl: '' },
  { name: 'Zoe Bennett', initials: 'ZB', avatarUrl: '' },
  { name: 'Ryan Lopez', initials: 'RL', avatarUrl: '' },
  { name: 'Sophia Reed', initials: 'SR', avatarUrl: '' },
  { name: 'Liam Brooks', initials: 'LB', avatarUrl: '' },
  { name: 'Ella Martinez', initials: 'EM', avatarUrl: '' },
  { name: 'Mason Clark', initials: 'MC', avatarUrl: '' },
  { name: 'Harper Young', initials: 'HY', avatarUrl: '' },
  { name: 'Ethan Hughes', initials: 'EH', avatarUrl: '' },
  { name: 'Aria Scott', initials: 'AS', avatarUrl: '' },
  { name: 'Logan Price', initials: 'LP', avatarUrl: '' },
  { name: 'Isla Moore', initials: 'IM', avatarUrl: '' },
  { name: 'Caleb Foster', initials: 'CF', avatarUrl: '' },
  { name: 'Nora Perry', initials: 'NP', avatarUrl: '' },
  { name: 'Owen Diaz', initials: 'OD', avatarUrl: '' },
  { name: 'Grace Watson', initials: 'GW', avatarUrl: '' },
  { name: 'Henry Sullivan', initials: 'HS', avatarUrl: '' },
]

/** User-created events in this browser (localStorage). */
export function getMergedEvents(): GymEvent[] {
  const extra = getUserCreatedEvents()
  return [...extra, ...events].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )
}

export function getEventById(id: string) {
  return getUserCreatedEventById(id) ?? events.find((e) => e.id === id)
}

export function spotsLeft(ev: GymEvent) {
  return Math.max(0, ev.maxSpots - ev.reservedCount)
}

export function formatMoney(cents: number | null) {
  if (cents === null || cents === 0) return 'Free'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    cents / 100,
  )
}
