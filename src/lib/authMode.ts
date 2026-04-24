/**
 * `local` (default): email/password stored in the browser only (no Firebase).
 * `firebase`: use Firebase Authentication when `src/lib/firebase.ts` is configured.
 */
export type AuthMode = 'local' | 'firebase'

export function getAuthMode(): AuthMode {
  const v = import.meta.env.VITE_AUTH_MODE?.trim().toLowerCase()
  return v === 'firebase' ? 'firebase' : 'local'
}
