import { communityPosts, type CommunityPost } from '@/data/mockData'

const STORAGE_KEY = 'jenscollective_user_posts_v1'
const COMMENTS_STORAGE_KEY = 'jenscollective_user_post_comments_v1'
const CHANGE_EVENT = 'jenscollective-user-posts'
export type CommunityComment = {
  id: string
  postId: string
  author: string
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
    typeof o.body === 'string' &&
    typeof o.at === 'string'
  )
}

function getUserCommunityComments(): CommunityComment[] {
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
  writePosts([post, ...getUserCommunityPosts()])
}

export function updateUserCommunityPost(postId: string, body: string) {
  const trimmed = body.trim()
  if (!trimmed) return
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
  const nextPosts = getUserCommunityPosts().filter((post) => post.id !== postId)
  const nextComments = getUserCommunityComments().filter((comment) => comment.postId !== postId)
  writePosts(nextPosts)
  writeComments(nextComments)
}

export function deleteUserCommunityPostsByAuthor(author: string) {
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
  writeComments([...getUserCommunityComments(), comment])
}

export function getCommunityCommentsByPostId(postId: string): CommunityComment[] {
  return getUserCommunityComments()
    .filter((comment) => comment.postId === postId)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
}

export function subscribeUserCommunityPosts(onChange: () => void) {
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
