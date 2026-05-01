import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { communityPosts, type CommunityPost } from '@/data/mockData'
import { ensureFirestoreAuth, getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase'

const STORAGE_KEY = 'jenscollective_user_posts_v1'
const COMMENTS_STORAGE_KEY = 'jenscollective_user_post_comments_v1'
const CHANGE_EVENT = 'jenscollective-user-posts'
const POSTS_COLLECTION = 'communityPosts'
const COMMENTS_COLLECTION = 'communityComments'
const firebaseEnabled = isFirebaseConfigured()
let firestorePostsUnsub: (() => void) | null = null
let firestoreCommentsUnsub: (() => void) | null = null
let cachedPosts: CommunityPost[] = []
let cachedComments: CommunityComment[] = []
const subscribers = new Set<() => void>()
export type CommunityComment = {
  id: string
  postId: string
  author: string
  /** Set for new comments so the author can delete them (account cleanup). */
  authorUid?: string
  body: string
  at: string
}

function isCommunityPost(x: unknown): x is CommunityPost {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    (typeof o.authorUid === 'string' || typeof o.authorUid === 'undefined') &&
    typeof o.author === 'string' &&
    typeof o.initials === 'string' &&
    (o.role === 'Member' || o.role === 'Coach' || o.role === 'Admin') &&
    typeof o.title === 'string' &&
    typeof o.body === 'string' &&
    typeof o.at === 'string' &&
    typeof o.likes === 'number' &&
    typeof o.comments === 'number'
  )
}

export function getUserCommunityPosts(): CommunityPost[] {
  if (firebaseEnabled) {
    const local = readLocalPosts()
    const byId = new Map<string, CommunityPost>()
    for (const row of local) byId.set(row.id, row)
    for (const row of cachedPosts) byId.set(row.id, row)
    return Array.from(byId.values()).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  }
  return readLocalPosts()
}

function readLocalPosts(): CommunityPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCommunityPost)
  } catch {
    return []
  }
}

export function getMergedCommunityPosts(): CommunityPost[] {
  return [...getUserCommunityPosts(), ...communityPosts].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )
}

function writePosts(list: CommunityPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function isCommunityComment(x: unknown): x is CommunityComment {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.postId === 'string' &&
    typeof o.author === 'string' &&
    (typeof o.authorUid === 'string' || typeof o.authorUid === 'undefined') &&
    typeof o.body === 'string' &&
    typeof o.at === 'string'
  )
}

function getUserCommunityComments(): CommunityComment[] {
  if (firebaseEnabled) {
    const local = readLocalComments()
    const byId = new Map<string, CommunityComment>()
    for (const row of local) byId.set(row.id, row)
    for (const row of cachedComments) byId.set(row.id, row)
    return Array.from(byId.values()).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
  }
  return readLocalComments()
}

function readLocalComments(): CommunityComment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCommunityComment)
  } catch {
    return []
  }
}

function writeComments(list: CommunityComment[]) {
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function appendUserCommunityPost(post: CommunityPost) {
  if (firebaseEnabled) {
    writePosts([post, ...readLocalPosts()])
    void ensureFirestoreAuth().then(() =>
      setDoc(doc(collection(getFirebaseDb(), POSTS_COLLECTION), post.id), post),
    )
    return
  }
  writePosts([post, ...getUserCommunityPosts()])
}

export function updateUserCommunityPost(postId: string, body: string) {
  const trimmed = body.trim()
  if (!trimmed) return
  if (firebaseEnabled) {
    const current = [...cachedPosts, ...readLocalPosts()].find((p) => p.id === postId)
    if (!current) return
    const next = {
      ...current,
      body: trimmed,
      title: trimmed.length > 64 ? `${trimmed.slice(0, 64).trim()}...` : trimmed,
    }
    void ensureFirestoreAuth().then(() =>
      setDoc(doc(collection(getFirebaseDb(), POSTS_COLLECTION), postId), next),
    )
    const nextLocal = readLocalPosts().map((post) => (post.id === postId ? next : post))
    writePosts(nextLocal)
    return
  }
  const next = getUserCommunityPosts().map((post) =>
    post.id === postId
      ? {
          ...post,
          body: trimmed,
          title: trimmed.length > 64 ? `${trimmed.slice(0, 64).trim()}...` : trimmed,
        }
      : post,
  )
  writePosts(next)
}

export function deleteUserCommunityPost(postId: string) {
  if (firebaseEnabled) {
    const nextPosts = readLocalPosts().filter((post) => post.id !== postId)
    const nextComments = readLocalComments().filter((comment) => comment.postId !== postId)
    writePosts(nextPosts)
    writeComments(nextComments)
    void ensureFirestoreAuth().then(async () => {
      const db = getFirebaseDb()
      await deleteDoc(doc(collection(db, POSTS_COLLECTION), postId))
      const commentSnap = await getDocs(
        query(collection(db, COMMENTS_COLLECTION), where('postId', '==', postId)),
      )
      if (!commentSnap.empty) {
        const batch = writeBatch(db)
        for (const row of commentSnap.docs) batch.delete(row.ref)
        await batch.commit()
      }
    })
    return
  }
  const nextPosts = getUserCommunityPosts().filter((post) => post.id !== postId)
  const nextComments = getUserCommunityComments().filter((comment) => comment.postId !== postId)
  writePosts(nextPosts)
  writeComments(nextComments)
}

export function deleteUserCommunityPostsByAuthor(author: string) {
  if (firebaseEnabled) return
  const target = author.trim().toLowerCase()
  if (!target) return
  const posts = getUserCommunityPosts()
  const removedIds = new Set(
    posts.filter((post) => post.author.trim().toLowerCase() === target).map((post) => post.id),
  )
  if (removedIds.size === 0) return
  const nextPosts = posts.filter((post) => !removedIds.has(post.id))
  const nextComments = getUserCommunityComments().filter((comment) => !removedIds.has(comment.postId))
  writePosts(nextPosts)
  writeComments(nextComments)
}

export function appendUserCommunityComment(comment: CommunityComment) {
  if (firebaseEnabled) {
    writeComments([...readLocalComments(), comment])
    void ensureFirestoreAuth().then(() =>
      setDoc(doc(collection(getFirebaseDb(), COMMENTS_COLLECTION), comment.id), comment),
    )
    return
  }
  writeComments([...getUserCommunityComments(), comment])
}

export function getCommunityCommentsByPostId(postId: string): CommunityComment[] {
  return getUserCommunityComments()
    .filter((comment) => comment.postId === postId)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
}

export function subscribeUserCommunityPosts(onChange: () => void) {
  if (firebaseEnabled) {
    subscribers.add(onChange)
    if (!firestorePostsUnsub || !firestoreCommentsUnsub) {
      void ensureFirestoreAuth().then(() => {
        const db = getFirebaseDb()
        firestorePostsUnsub = onSnapshot(
          query(collection(db, POSTS_COLLECTION), orderBy('at', 'desc')),
          (snap) => {
            cachedPosts = snap.docs
              .map((d) => d.data())
              .filter(isCommunityPost)
              .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
            // Keep local cache aligned with remote deletes/updates across devices.
            writePosts(cachedPosts)
            for (const fn of subscribers) fn()
          },
        )
        firestoreCommentsUnsub = onSnapshot(
          query(collection(db, COMMENTS_COLLECTION), orderBy('at', 'asc')),
          (snap) => {
            cachedComments = snap.docs.map((d) => d.data()).filter(isCommunityComment)
            // Keep local cache aligned with remote deletes/updates across devices.
            writeComments(cachedComments)
            for (const fn of subscribers) fn()
          },
        )
      })
    }
    return () => {
      subscribers.delete(onChange)
      if (!subscribers.size) {
        firestorePostsUnsub?.()
        firestoreCommentsUnsub?.()
        firestorePostsUnsub = null
        firestoreCommentsUnsub = null
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
