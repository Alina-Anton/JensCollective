import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase'
import { upsertMemberDirectoryEntry } from '@/lib/memberDirectory'

const STORAGE_KEY = 'jenscollective_member_requests_v1'
const CHANGE_EVENT = 'jenscollective-member-requests'
const REQUESTS_COLLECTION = 'memberRequests'
const firebaseEnabled = isFirebaseConfigured()

let firestoreUnsub: (() => void) | null = null
let cachedRequests: MemberRequest[] = []
const subscribers = new Set<() => void>()

export type MemberRequest = {
  id: string
  name: string
  referredBy: string
  details: string
  email?: string
  status: 'pending' | 'approved'
  createdAt: string
  reviewedAt?: string
}

function isMemberRequest(x: unknown): x is MemberRequest {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.referredBy === 'string' &&
    typeof o.details === 'string' &&
    (typeof o.email === 'string' || typeof o.email === 'undefined') &&
    (o.status === 'pending' || o.status === 'approved') &&
    typeof o.createdAt === 'string' &&
    (typeof o.reviewedAt === 'string' || typeof o.reviewedAt === 'undefined')
  )
}

function readLocalRequests(): MemberRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isMemberRequest)
  } catch {
    return []
  }
}

function writeLocalRequests(list: MemberRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function getMemberRequests(): MemberRequest[] {
  if (firebaseEnabled) {
    const byId = new Map<string, MemberRequest>()
    for (const row of readLocalRequests()) byId.set(row.id, row)
    for (const row of cachedRequests) byId.set(row.id, row)
    return Array.from(byId.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }
  return readLocalRequests().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function appendMemberRequest(input: Omit<MemberRequest, 'id' | 'status' | 'createdAt'>) {
  const request: MemberRequest = {
    id: `request-${crypto.randomUUID()}`,
    name: input.name.trim(),
    referredBy: input.referredBy.trim(),
    details: input.details.trim(),
    email: input.email?.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  writeLocalRequests([request, ...readLocalRequests()])
  if (firebaseEnabled) {
    void setDoc(doc(collection(getFirebaseDb(), REQUESTS_COLLECTION), request.id), request)
  }
}

export function upsertPendingMemberRequest(input: Omit<MemberRequest, 'id' | 'status' | 'createdAt'>) {
  const normalizedEmail = input.email?.trim().toLowerCase()
  const local = readLocalRequests()
  const existing = local.find(
    (r) => r.status === 'pending' && (r.email ?? '').trim().toLowerCase() === (normalizedEmail ?? ''),
  )

  if (!existing) {
    appendMemberRequest(input)
    return
  }

  const updated: MemberRequest = {
    ...existing,
    name: input.name.trim(),
    referredBy: input.referredBy.trim(),
    details: input.details.trim(),
    email: input.email?.trim(),
    createdAt: new Date().toISOString(),
  }
  const nextLocal = local.map((r) => (r.id === existing.id ? updated : r))
  writeLocalRequests(nextLocal)

  if (firebaseEnabled) {
    void setDoc(doc(collection(getFirebaseDb(), REQUESTS_COLLECTION), updated.id), updated)
  }
}

export async function hasApprovedMemberRequest(email: string) {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return false
  if (firebaseEnabled) {
    try {
      const q = query(
        collection(getFirebaseDb(), REQUESTS_COLLECTION),
        where('email', '==', normalized),
        where('status', '==', 'approved'),
        limit(1),
      )
      const snap = await getDocs(q)
      if (!snap.empty) return true
    } catch {
      // Fallback to local/cached data when remote lookup fails.
    }
  }
  return getMemberRequests().some(
    (r) => r.status === 'approved' && (r.email ?? '').trim().toLowerCase() === normalized,
  )
}

export function approveMemberRequest(request: MemberRequest) {
  const approved: MemberRequest = {
    ...request,
    status: 'approved',
    reviewedAt: new Date().toISOString(),
  }
  const nextLocal = readLocalRequests().map((r) => (r.id === request.id ? approved : r))
  writeLocalRequests(nextLocal)

  const uid = `requested-${request.id}`
  upsertMemberDirectoryEntry({
    uid,
    email: request.email?.trim().toLowerCase() || '',
    name: request.name,
    initials:
      request.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? '')
        .join('') || 'M',
    avatarUrl: '',
  })

  if (firebaseEnabled) {
    void updateDoc(doc(collection(getFirebaseDb(), REQUESTS_COLLECTION), request.id), {
      status: 'approved',
      reviewedAt: approved.reviewedAt,
    })
  }
}

export function subscribeMemberRequests(onChange: () => void) {
  if (firebaseEnabled) {
    subscribers.add(onChange)
    if (!firestoreUnsub) {
      const q = query(collection(getFirebaseDb(), REQUESTS_COLLECTION), orderBy('createdAt', 'desc'))
      firestoreUnsub = onSnapshot(q, (snap) => {
        cachedRequests = snap.docs
          .map((d) => d.data())
          .filter(isMemberRequest)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        for (const fn of subscribers) fn()
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

