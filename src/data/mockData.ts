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

export const events: GymEvent[] = [
  {
    id: 'evt-aurora-flow',
    title: 'Aurora Flow — breath-led mobility',
    description: 'Slow sequences, long exhales, and gentle strength to open the week.',
    longDescription:
      'A 55-minute guided session blending floor-based mobility, breath pacing, and light loaded carries. Ideal after a heavy weekend or before a demanding week. Mats provided; bring a light layer.',
    startsAt: '2026-04-15T07:00:00.000Z',
    endsAt: '2026-04-15T07:55:00.000Z',
    location: 'Studio B · Harbor Line',
    host: { name: 'Mira Chen', title: 'Head coach · Mobility', initials: 'MC' },
    priceCents: 2800,
    maxSpots: 14,
    reservedCount: 14,
    category: 'Mobility',
    waitlistEnabled: true,
    imageHint: 'mist / dawn / soft movement',
  },
  {
    id: 'evt-steel-thread',
    title: 'Steel Thread — tempo strength',
    description: 'Controlled eccentrics, crisp pauses, and a calm competitive edge.',
    longDescription:
      'Small-group strength with individualized loading. We rotate paired stations and finish with a short accessory circuit. Coaches cue form continuously—this is not a silent floor shift.',
    startsAt: '2026-04-16T17:30:00.000Z',
    endsAt: '2026-04-16T18:30:00.000Z',
    location: 'Floor · Iron Hall',
    host: { name: 'Noah Patel', title: 'Strength coach', initials: 'NP' },
    priceCents: 3200,
    maxSpots: 10,
    reservedCount: 8,
    category: 'Strength',
    waitlistEnabled: true,
    imageHint: 'steel / chalk / warm tungsten light',
  },
  {
    id: 'evt-coastal-engine',
    title: 'Coastal Engine — aerobic + skill',
    description: 'Intervals that feel athletic without the chaos of a crowded class.',
    longDescription:
      'Row, ski, and bike pieces with skill blocks on rings and kettlebells. Expect clear work/rest windows and optional scaling paths for newer members.',
    startsAt: '2026-04-17T06:15:00.000Z',
    endsAt: '2026-04-17T07:05:00.000Z',
    location: 'Track · North Wing',
    host: { name: 'Avery Brooks', title: 'Conditioning lead', initials: 'AB' },
    priceCents: null,
    maxSpots: 16,
    reservedCount: 15,
    category: 'Conditioning',
    waitlistEnabled: false,
    imageHint: 'ocean haze / endurance / steady rhythm',
  },
  {
    id: 'evt-saturday-social',
    title: 'Saturday Social — coffee + mobility reset',
    description: 'Community hour: espresso from our partner roaster, then a guided reset.',
    longDescription:
      'Drop in for conversation, light movement, and a short Q&A with coaches about programming for the month ahead. Partners and guests welcome within guest policy.',
    startsAt: '2026-04-19T09:30:00.000Z',
    endsAt: '2026-04-19T11:00:00.000Z',
    location: 'Lounge · Atrium',
    host: { name: 'Mira Chen', title: 'Head coach · Mobility', initials: 'MC' },
    priceCents: 0,
    maxSpots: 40,
    reservedCount: 22,
    category: 'Social',
    waitlistEnabled: false,
    imageHint: 'linen / ceramics / warm morning light',
  },
  {
    id: 'evt-lift-clinic',
    title: 'Lift Clinic — squat patterning',
    description: '90-minute workshop on bracing, depth, and sustainable loading.',
    longDescription:
      'Bring training shoes and a notebook. We film short reps (optional) and review on the big screen with consent-first guidelines. Limited spots to keep feedback personal.',
    startsAt: '2026-04-22T18:00:00.000Z',
    endsAt: '2026-04-22T19:30:00.000Z',
    location: 'Platform Room',
    host: { name: 'Noah Patel', title: 'Strength coach', initials: 'NP' },
    priceCents: 4500,
    maxSpots: 8,
    reservedCount: 5,
    category: 'Workshop',
    waitlistEnabled: true,
    imageHint: 'platform / chalk / focused faces',
  },
]

export const activityFeed: ActivityItem[] = [
  {
    id: 'a1',
    user: 'Sam Rivera',
    action: 'reserved a spot for',
    target: 'Steel Thread — tempo strength',
    at: '2026-04-13T14:22:00.000Z',
  },
  {
    id: 'a2',
    user: 'Coach Mira',
    action: 'posted an update in',
    target: 'Community',
    at: '2026-04-13T12:05:00.000Z',
  },
  {
    id: 'a3',
    user: 'Priya Shah',
    action: 'joined the waitlist for',
    target: 'Aurora Flow — breath-led mobility',
    at: '2026-04-13T11:41:00.000Z',
  },
  {
    id: 'a4',
    user: 'Leo Martin',
    action: 'completed',
    target: 'Coastal Engine — aerobic + skill',
    at: '2026-04-12T19:18:00.000Z',
  },
]

export const communityPosts: CommunityPost[] = [
  {
    id: 'p1',
    author: 'Mira Chen',
    initials: 'MC',
    role: 'Member',
    title: 'Who is down to drill this Friday after class?',
    body: 'I can stay for 30-40 minutes and work guard passing rounds if anyone wants to join.',
    at: '2026-04-13T12:05:00.000Z',
    likes: 18,
    comments: 4,
  },
  {
    id: 'p2',
    author: 'Jordan Ellis',
    initials: 'JE',
    role: 'Member',
    title: "Let's do a coffee walk on Sunday",
    body: 'Thinking right after the morning class. Easy pace, around 45 minutes.',
    at: '2026-04-12T21:16:00.000Z',
    likes: 15,
    comments: 3,
  },
  {
    id: 'p3',
    author: 'Alex Kim',
    initials: 'AK',
    role: 'Member',
    title: 'I have extra GI pants for donation. Who wants it?',
    body: 'Two pairs, lightly used, size A2. Happy to bring them to class this week.',
    at: '2026-04-11T16:02:00.000Z',
    likes: 11,
    comments: 3,
  },
]

export const reservations: Reservation[] = [
  { id: 'r1', eventId: 'evt-steel-thread', status: 'confirmed', payment: 'paid' },
  { id: 'r2', eventId: 'evt-saturday-social', status: 'confirmed', payment: 'waived' },
  { id: 'r3', eventId: 'evt-coastal-engine', status: 'attended', payment: 'paid' },
  { id: 'r4', eventId: 'evt-aurora-flow', status: 'waitlist', payment: 'pending' },
]

export const trendingEventIds = ['evt-steel-thread', 'evt-aurora-flow', 'evt-lift-clinic']

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

/** Seed events plus any created in this browser (localStorage). */
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
