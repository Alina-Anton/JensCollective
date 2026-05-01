import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { ensureFirestoreAuth, getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase'

export type MemberProfile = {
  preferredName: string
  phone?: string
  emergencyContact?: string
  shareContactInfo?: boolean
  trainingFocus: string
  aboutMe: string
  belt: string
  hobby: string
}

type StoredProfiles = Record<string, MemberProfile>

const STORAGE_KEY = 'jenscollective_member_profiles_v1'
const FIRESTORE_COLLECTION = 'memberProfiles'

function normalizeStorageKey(key: string): string {
  const t = key.trim()
  if (!t) return t
  if (t.includes('@')) return t.toLowerCase()
  return t
}


function readProfiles(): StoredProfiles {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as StoredProfiles
  } catch {
    return {}
  }
}

function writeProfiles(profiles: StoredProfiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

function isMemberProfileDoc(o: unknown): o is MemberProfile {
  if (!o || typeof o !== 'object') return false
  const x = o as Record<string, unknown>
  return (
    typeof x.preferredName === 'string' &&
    typeof x.trainingFocus === 'string' &&
    typeof x.aboutMe === 'string' &&
    typeof x.belt === 'string' &&
    typeof x.hobby === 'string' &&
    (typeof x.phone === 'string' || typeof x.phone === 'undefined') &&
    (typeof x.emergencyContact === 'string' || typeof x.emergencyContact === 'undefined') &&
    (typeof x.shareContactInfo === 'boolean' || typeof x.shareContactInfo === 'undefined')
  )
}

function fromFirestoreData(data: Record<string, unknown>): MemberProfile | null {
  if (!isMemberProfileDoc(data)) return null
  return {
    preferredName: data.preferredName,
    phone: data.phone,
    emergencyContact: data.emergencyContact,
    shareContactInfo: data.shareContactInfo,
    trainingFocus: data.trainingFocus,
    aboutMe: data.aboutMe,
    belt: data.belt,
    hobby: data.hobby,
  }
}

export function getMemberProfile(profileKey: string): MemberProfile | null {
  if (!profileKey) return null
  const profiles = readProfiles()
  const k = normalizeStorageKey(profileKey)
  const raw = profileKey.trim()
  return profiles[k] ?? profiles[raw] ?? null
}

export function getMemberProfileByKeys(profileKeys: Array<string | null | undefined>): MemberProfile | null {
  const profiles = readProfiles()
  for (const key of profileKeys) {
    if (!key?.trim()) continue
    const raw = key.trim()
    const norm = normalizeStorageKey(key)
    const hit = profiles[norm] ?? profiles[raw]
    if (hit) return hit
  }
  return null
}

/**
 * Persist profile locally (for this device) and, when `ownerUid` is a real Firebase account id,
 * to Firestore so other signed-in members can see it on the member profile page.
 */
export function saveMemberProfile(
  profileKey: string,
  profile: MemberProfile,
  ownerUid?: string | null,
) {
  if (!profileKey) return
  const profiles = readProfiles()
  const storageKey = normalizeStorageKey(profileKey)
  profiles[storageKey] = profile
  writeProfiles(profiles)

  const uid = ownerUid?.trim()
  if (!uid || uid.startsWith('requested-') || !isFirebaseConfigured()) return
  void ensureFirestoreAuth().then(() =>
    setDoc(doc(collection(getFirebaseDb(), FIRESTORE_COLLECTION), uid), {
      ...profile,
      updatedAt: new Date().toISOString(),
    }),
  )
}

export function deleteMemberProfilesByKeys(profileKeys: Array<string | null | undefined>) {
  const targets = new Set<string>()
  for (const k of profileKeys) {
    const t = (k ?? '').trim()
    if (!t) continue
    targets.add(t)
    targets.add(normalizeStorageKey(t))
  }
  if (!targets.size) return
  const profiles = readProfiles()
  let changed = false
  for (const key of Object.keys(profiles)) {
    if (targets.has(key) || targets.has(normalizeStorageKey(key))) {
      delete profiles[key]
      changed = true
    }
  }
  if (changed) writeProfiles(profiles)
}

/** Removes shared profile document (call on account delete or admin directory removal). */
export function deleteMemberProfileDoc(uid: string) {
  if (!uid || uid.startsWith('requested-') || !isFirebaseConfigured()) return
  void ensureFirestoreAuth().then(() =>
    deleteDoc(doc(collection(getFirebaseDb(), FIRESTORE_COLLECTION), uid)).catch(() => {
      // best effort
    }),
  )
}

export function findMemberProfileByName(name: string): MemberProfile | null {
  return findMemberProfileByAnyNames(name)
}

/** Match saved preferred name against any of the given directory / URL names. */
function compactComparable(s: string): string {
  return s.trim().toLowerCase().replace(/[\s._-]+/g, '')
}

function expandProfileLookupNeedles(
  names: Array<string | null | undefined>,
): Set<string> {
  const needles = new Set<string>()
  for (const raw of names) {
    const t = (raw ?? '').trim().toLowerCase()
    if (!t) continue
    needles.add(t)
    needles.add(compactComparable(t))
    if (t.includes('@')) {
      const local = t.split('@')[0] ?? ''
      if (local) {
        needles.add(local)
        needles.add(compactComparable(local))
      }
    }
  }
  return needles
}

export function findMemberProfileByAnyNames(...names: Array<string | null | undefined>): MemberProfile | null {
  const needles = expandProfileLookupNeedles(names)
  if (!needles.size) return null
  const profiles = readProfiles()
  for (const profile of Object.values(profiles)) {
    const pref = profile.preferredName.trim().toLowerCase()
    const prefCompact = compactComparable(profile.preferredName)
    if (pref && (needles.has(pref) || needles.has(prefCompact))) return profile
  }
  return null
}

/** Match a stored profile to a directory row (keys + preferred name / email local-part heuristics). */
export function findMemberProfileForDirectoryMember(entry: {
  uid?: string
  email?: string
  name?: string
}): MemberProfile | null {
  const uid = entry.uid?.trim()
  const emailNorm = entry.email?.trim().toLowerCase() ?? ''
  const profiles = readProfiles()
  for (const [key, profile] of Object.entries(profiles)) {
    if (uid && key === uid) return profile
    if (emailNorm && (normalizeStorageKey(key) === emailNorm || key.trim().toLowerCase() === emailNorm)) {
      return profile
    }
  }
  const emailLocal = entry.email?.includes('@')
    ? entry.email.trim().toLowerCase().split('@')[0]
    : undefined
  const byKeys = getMemberProfileByKeys([
    entry.uid,
    entry.email,
    entry.name,
    emailLocal,
  ])
  if (byKeys) return byKeys
  return findMemberProfileByAnyNames(entry.name, entry.email, entry.uid, emailLocal)
}

export function subscribeMemberProfileForUid(
  uid: string | undefined,
  onData: (profile: MemberProfile | null) => void,
): () => void {
  if (!uid || uid.startsWith('requested-') || !isFirebaseConfigured()) {
    queueMicrotask(() => onData(null))
    return () => {}
  }
  let unsub: (() => void) | null = null
  let cancelled = false
  void ensureFirestoreAuth().then(() => {
    if (cancelled) return
    const ref = doc(collection(getFirebaseDb(), FIRESTORE_COLLECTION), uid)
    unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          onData(null)
          return
        }
        const parsed = fromFirestoreData(snap.data() as Record<string, unknown>)
        onData(parsed)
      },
      // Do not clear profile on transient errors (permissions/network); listener may recover.
      (err) => console.warn('[memberProfiles]', uid, err),
    )
  })
  return () => {
    cancelled = true
    unsub?.()
  }
}
