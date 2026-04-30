import { collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore'
import { ensureFirestoreAuth, getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase'

const STORAGE_KEY = 'jenscollective_user_event_comments_v1'
const CHANGE_EVENT = 'jenscollective-user-event-comments'
const COMMENTS_COLLECTION = 'eventComments'
const firebaseEnabled = isFirebaseConfigured()
let firestoreUnsub: (() => void) | null = null
let cachedComments: EventComment[] = []
const subscribers = new Set<() => void>()

export type EventComment = {
  id: string
  eventId: string
  author: string
  body: string
  at: string
}

function isEventComment(x: unknown): x is EventComment {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.eventId === 'string' &&
    typeof o.author === 'string' &&
    typeof o.body === 'string' &&
    typeof o.at === 'string'
  )
}

function readLocalComments(): EventComment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isEventComment)
  } catch {
    return []
  }
}

function writeComments(list: EventComment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function getAllEventComments() {
  if (firebaseEnabled) {
    const byId = new Map<string, EventComment>()
    for (const row of readLocalComments()) byId.set(row.id, row)
    for (const row of cachedComments) byId.set(row.id, row)
    return Array.from(byId.values()).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
  }
  return readLocalComments()
}

export function getEventCommentsByEventId(eventId: string) {
  return getAllEventComments()
    .filter((row) => row.eventId === eventId)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
}

export function appendEventComment(input: Omit<EventComment, 'id' | 'at'>) {
  const comment: EventComment = {
    id: `event-comment-${crypto.randomUUID()}`,
    eventId: input.eventId,
    author: input.author,
    body: input.body.trim(),
    at: new Date().toISOString(),
  }
  if (!comment.body) return
  writeComments([...readLocalComments(), comment])
  if (firebaseEnabled) {
    void ensureFirestoreAuth().then(() =>
      setDoc(doc(collection(getFirebaseDb(), COMMENTS_COLLECTION), comment.id), comment),
    )
  }
}

export function subscribeEventComments(onChange: () => void) {
  if (firebaseEnabled) {
    subscribers.add(onChange)
    if (!firestoreUnsub) {
      void ensureFirestoreAuth().then(() => {
        const q = query(collection(getFirebaseDb(), COMMENTS_COLLECTION), orderBy('at', 'asc'))
        firestoreUnsub = onSnapshot(q, (snap) => {
          cachedComments = snap.docs.map((d) => d.data()).filter(isEventComment)
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

