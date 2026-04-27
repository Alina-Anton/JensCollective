import type { EventCategory, GymEvent } from '@/data/mockData'

const STORAGE_KEY = 'jenscollective_user_events_v1'
const CHANGE_EVENT = 'jenscollective-user-events'

const CATEGORIES: EventCategory[] = [
  'Strength',
  'Conditioning',
  'Mobility',
  'Workshop',
  'Social',
]

function isGymEvent(x: unknown): x is GymEvent {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  const host = o.host
  if (!host || typeof host !== 'object') return false
  const h = host as Record<string, unknown>
  if (
    typeof o.id !== 'string' ||
    (typeof o.creatorUid !== 'string' && typeof o.creatorUid !== 'undefined') ||
    typeof o.title !== 'string' ||
    typeof o.description !== 'string' ||
    typeof o.longDescription !== 'string' ||
    typeof o.startsAt !== 'string' ||
    typeof o.endsAt !== 'string' ||
    typeof o.location !== 'string' ||
    typeof h.name !== 'string' ||
    typeof h.title !== 'string' ||
    typeof h.initials !== 'string' ||
    !(o.priceCents === null || typeof o.priceCents === 'number') ||
    typeof o.maxSpots !== 'number' ||
    typeof o.reservedCount !== 'number' ||
    typeof o.category !== 'string' ||
    typeof o.waitlistEnabled !== 'boolean' ||
    typeof o.imageHint !== 'string'
  ) {
    return false
  }
  return true
}

export function getUserCreatedEvents(): GymEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isGymEvent)
  } catch {
    return []
  }
}

function writeUserCreatedEvents(list: GymEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function appendUserCreatedEvent(event: GymEvent) {
  writeUserCreatedEvents([...getUserCreatedEvents(), event])
}

export function updateUserCreatedEvent(eventId: string, event: GymEvent) {
  const next = getUserCreatedEvents().map((row) => (row.id === eventId ? event : row))
  writeUserCreatedEvents(next)
}

export function deleteUserCreatedEvent(eventId: string) {
  const next = getUserCreatedEvents().filter((row) => row.id !== eventId)
  writeUserCreatedEvents(next)
}

export function subscribeUserCreatedEvents(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onChange()
  }
  const onCustom = () => onChange()
  window.addEventListener('storage', onStorage)
  window.addEventListener(CHANGE_EVENT, onCustom)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(CHANGE_EVENT, onCustom)
  }
}

export function getUserCreatedEventById(id: string): GymEvent | undefined {
  return getUserCreatedEvents().find((e) => e.id === id)
}

export function parseCategory(value: string): EventCategory {
  return CATEGORIES.includes(value as EventCategory) ? (value as EventCategory) : 'Mobility'
}

/** Local datetime strings from `<input type="date">` and `<input type="time">` → ISO range (1h duration). */
export function localDateTimeToIsoRange(dateStr: string, timeStr: string): { startsAt: string; endsAt: string } {
  const start = new Date(`${dateStr}T${timeStr || '09:00'}`)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  return { startsAt: start.toISOString(), endsAt: end.toISOString() }
}
