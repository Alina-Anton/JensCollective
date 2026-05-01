import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore'
import type { AppUser } from '@/lib/appUser'
import { deleteMemberDirectoryEntry } from '@/lib/memberDirectory'
import { deleteMemberProfileDoc, deleteMemberProfilesByKeys } from '@/lib/memberProfileStorage'
import { deleteMemberRequestsForEmail } from '@/lib/memberRequests'
import { setProfileAvatarUrl } from '@/lib/profileAvatarStorage'
import { ensureFirestoreAuth, getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase'

const EVENTS_COLLECTION = 'events'
const POSTS_COLLECTION = 'communityPosts'
const COMMENTS_COLLECTION = 'communityComments'
const EVENT_COMMENTS_COLLECTION = 'eventComments'
const RESERVATIONS_COLLECTION = 'eventReservations'
const MEMBERS_COLLECTION = 'membersDirectory'

const LS_POSTS = 'jenscollective_user_posts_v1'
const LS_POST_COMMENTS = 'jenscollective_user_post_comments_v1'
const LS_EVENTS = 'jenscollective_user_events_v1'
const LS_EVENT_COMMENTS = 'jenscollective_user_event_comments_v1'

async function deleteByField(collectionName: string, fieldName: string, value: string) {
  if (!value) return
  const db = getFirebaseDb()
  const snap = await getDocs(query(collection(db, collectionName), where(fieldName, '==', value)))
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = writeBatch(db)
    for (const row of snap.docs.slice(i, i + 400)) batch.delete(row.ref)
    await batch.commit()
  }
}

function purgeLocalPosts(uid: string) {
  try {
    const raw = localStorage.getItem(LS_POSTS)
    if (!raw) return
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return
    const next = parsed.filter((row) => {
      if (!row || typeof row !== 'object') return true
      const o = row as { authorUid?: string }
      return o.authorUid !== uid
    })
    localStorage.setItem(LS_POSTS, JSON.stringify(next))
  } catch {
    // ignore
  }
}

function purgeLocalPostComments(uid: string) {
  try {
    const raw = localStorage.getItem(LS_POST_COMMENTS)
    if (!raw) return
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return
    const next = parsed.filter((row) => {
      if (!row || typeof row !== 'object') return true
      const o = row as { authorUid?: string }
      return o.authorUid !== uid
    })
    localStorage.setItem(LS_POST_COMMENTS, JSON.stringify(next))
  } catch {
    // ignore
  }
}

function purgeLocalEvents(uid: string) {
  try {
    const raw = localStorage.getItem(LS_EVENTS)
    if (!raw) return
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return
    const next = parsed.filter((row) => {
      if (!row || typeof row !== 'object') return true
      const o = row as { creatorUid?: string }
      return o.creatorUid !== uid
    })
    localStorage.setItem(LS_EVENTS, JSON.stringify(next))
  } catch {
    // ignore
  }
}

function purgeLocalEventComments(uid: string) {
  try {
    const raw = localStorage.getItem(LS_EVENT_COMMENTS)
    if (!raw) return
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return
    const next = parsed.filter((row) => {
      if (!row || typeof row !== 'object') return true
      const o = row as { authorUid?: string }
      return o.authorUid !== uid
    })
    localStorage.setItem(LS_EVENT_COMMENTS, JSON.stringify(next))
  } catch {
    // ignore
  }
}

function purgeLocalReservations(uid: string) {
  try {
    const raw = localStorage.getItem('jenscollective_user_reservations_v1')
    if (!raw) return
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return
    const next = parsed.filter((row) => {
      if (!row || typeof row !== 'object') return true
      const o = row as { userUid?: string }
      return o.userUid !== uid
    })
    localStorage.setItem('jenscollective_user_reservations_v1', JSON.stringify(next))
  } catch {
    // ignore
  }
}

export async function cleanupDeletedAccountData(user: AppUser | null) {
  if (!user) return
  const email = user.email?.trim().toLowerCase() ?? ''
  const displayName = user.displayName?.trim() ?? ''

  deleteMemberProfilesByKeys([user.uid, email, displayName])
  deleteMemberProfileDoc(user.uid)
  await deleteMemberRequestsForEmail(email)
  deleteMemberDirectoryEntry(user.uid, email || undefined)

  purgeLocalPosts(user.uid)
  purgeLocalPostComments(user.uid)
  purgeLocalEvents(user.uid)
  purgeLocalEventComments(user.uid)
  purgeLocalReservations(user.uid)
  setProfileAvatarUrl(null)

  if (!isFirebaseConfigured()) return
  await ensureFirestoreAuth()

  await Promise.allSettled([
    deleteByField(EVENTS_COLLECTION, 'creatorUid', user.uid),
    deleteByField(POSTS_COLLECTION, 'authorUid', user.uid),
    deleteByField(RESERVATIONS_COLLECTION, 'userUid', user.uid),
    deleteByField(COMMENTS_COLLECTION, 'authorUid', user.uid),
    deleteByField(EVENT_COMMENTS_COLLECTION, 'authorUid', user.uid),
    email ? deleteByField(MEMBERS_COLLECTION, 'email', email) : Promise.resolve(),
  ])

  // Legacy comments (no authorUid) may remain in Firestore; new comments are deletable by uid.
  if (displayName) {
    await Promise.allSettled([
      deleteByField(COMMENTS_COLLECTION, 'author', displayName),
      deleteByField(EVENT_COMMENTS_COLLECTION, 'author', displayName),
    ])
  }
}
