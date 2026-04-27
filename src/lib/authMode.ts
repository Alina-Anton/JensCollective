/**
 * `firebase` (default): use Firebase Authentication when `src/lib/firebase.ts` is configured.
 * `local`: email/password stored in the browser only (no Firebase).
 */
export type AuthMode = 'local' | 'firebase'

export function getAuthMode(): AuthMode {
  const v = import.meta.env.VITE_AUTH_MODE?.trim().toLowerCase()
  return v === 'local' ? 'local' : 'firebase'
}
