import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore'
import type { Reservation } from '@/data/mockData'
import { ensureFirestoreAuth, getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase'

const STORAGE_KEY = 'jenscollective_user_reservations_v1'
const CHANGE_EVENT = 'jenscollective-user-reservations'
const RESERVATIONS_COLLECTION = 'eventReservations'
const firebaseEnabled = isFirebaseConfigured()
let firestoreUnsub: (() => void) | null = null
let cachedReservations: SharedReservation[] = []
const subscribers = new Set<() => void>()

export type SharedReservation = Reservation & {
  createdAt: string
  userUid: string
  userName: string
}

function isStoredReservation(x: unknown): x is SharedReservation {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.eventId === 'string' &&
    typeof o.userUid === 'string' &&
    typeof o.userName === 'string' &&
    (o.status === 'confirmed' || o.status === 'waitlist' || o.status === 'attended' || o.status === 'cancelled') &&
    (o.payment === 'paid' || o.payment === 'pending' || o.payment === 'waived') &&
    typeof o.createdAt === 'string'
  )
}

function read(): SharedReservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isStoredReservation)
  } catch {
    return []
  }
}

function write(next: SharedReservation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function getAllReservations(): SharedReservation[] {
  if (firebaseEnabled) {
    const byId = new Map<string, SharedReservation>()
    for (const row of read()) byId.set(row.id, row)
    for (const row of cachedReservations) byId.set(row.id, row)
    return Array.from(byId.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  return read().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getUserReservations(userUid?: string): Reservation[] {
  if (!userUid) return []
  return getAllReservations().filter((r) => r.userUid === userUid)
}

export function getReservationNamesByEventId(eventId: string) {
  return Array.from(
    new Set(
      getAllReservations()
        .filter((r) => r.eventId === eventId && (r.status === 'confirmed' || r.status === 'waitlist'))
        .map((r) => r.userName),
    ),
  )
}

export function upsertUserReservation(
  eventId: string,
  status: 'confirmed' | 'waitlist',
  user: { uid: string; name: string },
) {
  const existing = read()
  const idx = existing.findIndex((r) => r.eventId === eventId && r.userUid === user.uid)
  const nextRow: SharedReservation = {
    id: idx >= 0 ? existing[idx].id : `res-${crypto.randomUUID()}`,
    eventId,
    userUid: user.uid,
    userName: user.name,
    status,
    payment: status === 'confirmed' ? 'pending' : 'waived',
    createdAt: new Date().toISOString(),
  }
  if (idx >= 0) existing[idx] = nextRow
  else existing.unshift(nextRow)
  write(existing)
  if (firebaseEnabled) {
    void ensureFirestoreAuth().then(() =>
      setDoc(doc(collection(getFirebaseDb(), RESERVATIONS_COLLECTION), nextRow.id), nextRow),
    )
  }
}

export function cancelUserReservation(eventId: string, userUid: string) {
  const next = read().filter((r) => !(r.eventId === eventId && r.userUid === userUid))
  const removed = read().find((r) => r.eventId === eventId && r.userUid === userUid)
  write(next)
  if (firebaseEnabled && removed) {
    void ensureFirestoreAuth().then(() =>
      deleteDoc(doc(collection(getFirebaseDb(), RESERVATIONS_COLLECTION), removed.id)),
    )
  }
}

export function getReservedEventIdSet(userUid?: string) {
  if (!userUid) return new Set<string>()
  return new Set(
    getAllReservations()
      .filter((r) => r.userUid === userUid && (r.status === 'confirmed' || r.status === 'waitlist'))
      .map((r) => r.eventId),
  )
}

export function subscribeUserReservations(onChange: () => void) {
  if (firebaseEnabled) {
    subscribers.add(onChange)
    if (!firestoreUnsub) {
      void ensureFirestoreAuth().then(() => {
        const q = query(collection(getFirebaseDb(), RESERVATIONS_COLLECTION), orderBy('createdAt', 'desc'))
        firestoreUnsub = onSnapshot(q, (snap) => {
          cachedReservations = snap.docs.map((d) => d.data()).filter(isStoredReservation)
          // Keep local cache aligned with remote deletes/updates across devices.
          write(cachedReservations)
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

