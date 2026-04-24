import type { AppUser } from '@/lib/appUser'

const USERS_KEY = 'jenscollective_auth_users_v1'
export const LOCAL_AUTH_SESSION_KEY = 'jenscollective_auth_session_v1'

type StoredUser = {
  uid: string
  email: string
  displayName: string
  passwordSaltB64: string
  passwordHashB64: string
}

function toB64(u8: Uint8Array): string {
  let s = ''
  for (const b of u8) s += String.fromCharCode(b)
  return btoa(s)
}

function fromB64(s: string): Uint8Array {
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function randomSalt(): Uint8Array {
  const s = new Uint8Array(16)
  crypto.getRandomValues(s)
  return s
}

async function pbkdf2Hash(password: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )
  return toB64(new Uint8Array(bits))
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is StoredUser =>
        x &&
        typeof x === 'object' &&
        typeof (x as StoredUser).uid === 'string' &&
        typeof (x as StoredUser).email === 'string' &&
        typeof (x as StoredUser).displayName === 'string' &&
        typeof (x as StoredUser).passwordSaltB64 === 'string' &&
        typeof (x as StoredUser).passwordHashB64 === 'string',
    )
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function storedToApp(u: StoredUser): AppUser {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: null,
  }
}

function sessionUid(): string | null {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_SESSION_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as { uid?: string }
    return typeof o.uid === 'string' ? o.uid : null
  } catch {
    return null
  }
}

function setSessionUid(uid: string | null) {
  if (!uid) localStorage.removeItem(LOCAL_AUTH_SESSION_KEY)
  else localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify({ uid }))
}

export function getLocalSessionUser(): AppUser | null {
  const uid = sessionUid()
  if (!uid) return null
  const row = readUsers().find((u) => u.uid === uid)
  return row ? storedToApp(row) : null
}

function normEmail(email: string) {
  return email.trim().toLowerCase()
}

function authError(code: string, message?: string) {
  return Object.assign(new Error(message ?? code), { code })
}

export async function localSignUpWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<AppUser> {
  const em = normEmail(email)
  if (readUsers().some((u) => u.email === em)) {
    throw authError('auth/email-already-in-use')
  }
  const salt = randomSalt()
  const passwordHashB64 = await pbkdf2Hash(password, salt)
  const row: StoredUser = {
    uid: crypto.randomUUID(),
    email: em,
    displayName: displayName.trim(),
    passwordSaltB64: toB64(salt),
    passwordHashB64,
  }
  writeUsers([...readUsers(), row])
  setSessionUid(row.uid)
  return storedToApp(row)
}

export async function localSignInWithEmail(email: string, password: string): Promise<AppUser> {
  const em = normEmail(email)
  const row = readUsers().find((u) => u.email === em)
  if (!row) throw authError('auth/invalid-credential')
  const salt = fromB64(row.passwordSaltB64)
  const hash = await pbkdf2Hash(password, salt)
  if (hash !== row.passwordHashB64) throw authError('auth/invalid-credential')
  setSessionUid(row.uid)
  return storedToApp(row)
}

export function localSignOut() {
  setSessionUid(null)
}
