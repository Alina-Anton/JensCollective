import type { AppUser } from '@/lib/appUser'
import { preferredDisplayNameForUser, displayNameForUser } from '@/lib/userDisplay'

const ADMIN_NAMES = new Set(['jen clanton', 'alina anton'])
const ADMIN_EMAILS = new Set(['aa.in.labs@gmail.com', 'jen.clanton@gmail.com'])

function normalize(value: string) {
  return value.trim().toLowerCase()
}

export function isAdminUser(user: AppUser | null | undefined) {
  if (!user) return false
  const email = user.email?.trim().toLowerCase()
  if (email && ADMIN_EMAILS.has(email)) return true
  const names = [preferredDisplayNameForUser(user), displayNameForUser(user)]
  return names.some((name) => ADMIN_NAMES.has(normalize(name)))
}

