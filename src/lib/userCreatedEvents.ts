import type { EventCategory, GymEvent } from '@/data/mockData'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import { ensureFirestoreAuth, getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase'

const STORAGE_KEY = 'jenscollective_user_events_v1'
const CHANGE_EVENT = 'jenscollective-user-events'
const EVENTS_COLLECTION = 'events'
const firebaseEnabled = isFirebaseConfigured()
let firestoreUnsub: (() => void) | null = null
let cachedEvents: GymEvent[] = []
const subscribers = new Set<() => void>()

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
  if (firebaseEnabled) {
    const local = readLocalEvents()
    return [...cachedEvents, ...local].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
  }
  return readLocalEvents()
}

function readLocalEvents(): GymEvent[] {
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
  if (firebaseEnabled) {
    writeUserCreatedEvents([...readLocalEvents(), event])
    void ensureFirestoreAuth().then(() =>
      setDoc(doc(collection(getFirebaseDb(), EVENTS_COLLECTION), event.id), event),
    )
    return
  }
  writeUserCreatedEvents([...getUserCreatedEvents(), event])
}

export function updateUserCreatedEvent(eventId: string, event: GymEvent) {
  if (firebaseEnabled) {
    const nextLocal = readLocalEvents().map((row) => (row.id === eventId ? event : row))
    writeUserCreatedEvents(nextLocal)
    void ensureFirestoreAuth().then(() =>
      setDoc(doc(collection(getFirebaseDb(), EVENTS_COLLECTION), eventId), event),
    )
    return
  }
  const next = getUserCreatedEvents().map((row) => (row.id === eventId ? event : row))
  writeUserCreatedEvents(next)
}

export function deleteUserCreatedEvent(eventId: string) {
  if (firebaseEnabled) {
    const nextLocal = readLocalEvents().filter((row) => row.id !== eventId)
    writeUserCreatedEvents(nextLocal)
    void ensureFirestoreAuth().then(() =>
      deleteDoc(doc(collection(getFirebaseDb(), EVENTS_COLLECTION), eventId)),
    )
    return
  }
  const next = getUserCreatedEvents().filter((row) => row.id !== eventId)
  writeUserCreatedEvents(next)
}

export function subscribeUserCreatedEvents(onChange: () => void) {
  if (firebaseEnabled) {
    subscribers.add(onChange)
    if (!firestoreUnsub) {
      void ensureFirestoreAuth().then(() => {
        const q = query(collection(getFirebaseDb(), EVENTS_COLLECTION), orderBy('startsAt', 'asc'))
        firestoreUnsub = onSnapshot(q, (snap) => {
          cachedEvents = snap.docs
            .map((d) => d.data())
            .filter(isGymEvent)
            .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
          for (const fn of subscribers) fn()
        })
      })
    }
    return () => {
      subscribers.delete(onChange)
      if (!subscribers.size && firestoreUnsub) {
        firestoreUnsub()
        firestoreUnsub = null
      }
    }
  }
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
  if (firebaseEnabled) return cachedEvents.find((e) => e.id === id)
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
