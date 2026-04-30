import type { Reservation } from '@/data/mockData'

const STORAGE_KEY = 'jenscollective_user_reservations_v1'
const CHANGE_EVENT = 'jenscollective-user-reservations'

type StoredReservation = Reservation & { createdAt: string }

function isStoredReservation(x: unknown): x is StoredReservation {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.eventId === 'string' &&
    (o.status === 'confirmed' || o.status === 'waitlist' || o.status === 'attended' || o.status === 'cancelled') &&
    (o.payment === 'paid' || o.payment === 'pending' || o.payment === 'waived') &&
    typeof o.createdAt === 'string'
  )
}

function read(): StoredReservation[] {
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

function write(next: StoredReservation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function getUserReservations(): Reservation[] {
  return read().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function upsertUserReservation(eventId: string, status: 'confirmed' | 'waitlist') {
  const existing = read()
  const idx = existing.findIndex((r) => r.eventId === eventId)
  const nextRow: StoredReservation = {
    id: idx >= 0 ? existing[idx].id : `res-${crypto.randomUUID()}`,
    eventId,
    status,
    payment: status === 'confirmed' ? 'pending' : 'waived',
    createdAt: new Date().toISOString(),
  }
  if (idx >= 0) {
    existing[idx] = nextRow
    write(existing)
    return
  }
  write([nextRow, ...existing])
}

export function cancelUserReservation(eventId: string) {
  write(read().filter((r) => r.eventId !== eventId))
}

export function getReservedEventIdSet() {
  return new Set(
    getUserReservations()
      .filter((r) => r.status === 'confirmed' || r.status === 'waitlist')
      .map((r) => r.eventId),
  )
}

export function subscribeUserReservations(onChange: () => void) {
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

