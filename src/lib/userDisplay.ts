import type { AppUser } from '@/lib/appUser'

export function displayNameForUser(user: AppUser | null | undefined): string {
  if (!user) return 'Member'
  const n = user.displayName?.trim()
  if (n) return n
  const email = user.email ?? ''
  const local = email.split('@')[0]
  if (!local) return 'Member'
  return local
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function initialsForUser(user: AppUser | null | undefined): string {
  if (!user) return '?'
  const n = user.displayName?.trim()
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
    }
    if (parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0].charAt(0) + '?').toUpperCase()
  }
  const email = user.email ?? ''
  if (email.length >= 2) return email.slice(0, 2).toUpperCase()
  return 'ME'
}
