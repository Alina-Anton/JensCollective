import { createContext } from 'react'
import type { AppUser } from '@/lib/appUser'

export type AuthContextValue = {
  user: AppUser | null
  loading: boolean
  /** False only in Firebase mode when web SDK env is incomplete. Local mode is always ready. */
  authReady: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  signOutUser: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
