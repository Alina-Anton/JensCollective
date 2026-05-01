import type { AppUser } from '@/lib/appUser'

const ADMIN_EMAILS = new Set(['alinanton13@gmail.com'])

export function isAdminUser(user: AppUser | null | undefined) {
  if (!user) return false
  const email = user.email?.trim().toLowerCase()
  return Boolean(email && ADMIN_EMAILS.has(email))
}

