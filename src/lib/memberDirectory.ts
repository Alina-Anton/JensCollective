import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { ensureFirestoreAuth, getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase'
import { getLocalAuthMemberDirectory, subscribeLocalAuthUsers } from '@/lib/localCredentialsAuth'
import type { AppUser } from '@/lib/appUser'

const MEMBERS_COLLECTION = 'membersDirectory'
const firebaseEnabled = isFirebaseConfigured()
const listeners = new Set<() => void>()
let firestoreUnsub: (() => void) | null = null
let cachedRemoteMembers: MemberDirectoryEntry[] = []

export type MemberDirectoryEntry = {
  uid: string
  email: string
  name: string
  initials: string
  avatarUrl: string
}

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'M'
  )
}

function normalizeMember(x: unknown): MemberDirectoryEntry | null {
  if (!x || typeof x !== 'object') return null
  const o = x as Record<string, unknown>
  if (typeof o.uid !== 'string' || typeof o.email !== 'string' || typeof o.name !== 'string') return null
  return {
    uid: o.uid,
    email: o.email,
    name: o.name,
    initials: typeof o.initials === 'string' && o.initials ? o.initials : initialsFromName(o.name),
    avatarUrl: typeof o.avatarUrl === 'string' ? o.avatarUrl : '',
  }
}

export function getMergedMemberDirectory(): MemberDirectoryEntry[] {
  const local = getLocalAuthMemberDirectory()
  const merged = [...(firebaseEnabled ? cachedRemoteMembers : []), ...local]
  const byName = new Map<string, MemberDirectoryEntry>()
  for (const member of merged) {
    const key = member.name.trim().toLowerCase()
    if (!key) continue
    if (!byName.has(key)) byName.set(key, member)
  }
  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export function subscribeMemberDirectory(onChange: () => void) {
  listeners.add(onChange)
  const localUnsub = subscribeLocalAuthUsers(onChange)
  if (firebaseEnabled && !firestoreUnsub) {
    for (const localMember of getLocalAuthMemberDirectory()) {
      const entry: MemberDirectoryEntry = {
        uid: localMember.uid,
        email: localMember.email,
        name: localMember.name,
        initials: localMember.initials,
        avatarUrl: localMember.avatarUrl,
      }
      void ensureFirestoreAuth().then(() =>
        setDoc(doc(collection(getFirebaseDb(), MEMBERS_COLLECTION), localMember.uid), entry),
      )
    }
    void ensureFirestoreAuth().then(() => {
      firestoreUnsub = onSnapshot(collection(getFirebaseDb(), MEMBERS_COLLECTION), (snap) => {
        cachedRemoteMembers = snap.docs
          .map((d) => normalizeMember(d.data()))
          .filter((x): x is MemberDirectoryEntry => Boolean(x))
          .sort((a, b) => a.name.localeCompare(b.name))
        for (const fn of listeners) fn()
      })
    })
  }
  return () => {
    localUnsub()
    listeners.delete(onChange)
    if (!listeners.size && firestoreUnsub) {
      firestoreUnsub()
      firestoreUnsub = null
    }
  }
}

export function upsertMemberDirectoryEntryFromUser(user: AppUser | null) {
  if (!firebaseEnabled || !user) return
  const name = user.displayName?.trim() || user.email?.split('@')[0] || 'Member'
  const email = user.email?.trim().toLowerCase() || ''
  const initials = initialsFromName(name)
  const entry: MemberDirectoryEntry = {
    uid: user.uid,
    email,
    name,
    initials,
    avatarUrl: user.photoURL ?? '',
  }
  void ensureFirestoreAuth().then(() =>
    setDoc(doc(collection(getFirebaseDb(), MEMBERS_COLLECTION), user.uid), entry),
  )
}

