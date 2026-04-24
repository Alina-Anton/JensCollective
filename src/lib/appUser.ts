import type { User as FirebaseUser } from 'firebase/auth'

/** Minimal user shape used across the app (Firebase or local auth). */
export type AppUser = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export function firebaseUserToAppUser(u: FirebaseUser): AppUser {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
  }
}
