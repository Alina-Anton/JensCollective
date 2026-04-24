import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

/**
 * Default web app config for project `jenscollective-2026`.
 * Override any field with VITE_FIREBASE_* in `.env.local` (see `.env.example`).
 */
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCT8jnGIB5JcLMbkRqPm2pdBHmMuFANESg',
  authDomain: 'jenscollective-2026.firebaseapp.com',
  projectId: 'jenscollective-2026',
  storageBucket: 'jenscollective-2026.firebasestorage.app',
  messagingSenderId: '181614118847',
  appId: '1:181614118847:web:ba4e45939be7cdf20c430a',
} as const

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId,
  )
}

let app: FirebaseApp | undefined
let auth: Auth | undefined

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase configuration is incomplete.')
  }
  if (!app) app = initializeApp(firebaseConfig)
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp())
  return auth
}

/** Opens Authentication → Sign-in method (enable Email/Password there). */
export function firebaseConsoleAuthenticationUrl(): string {
  const id = firebaseConfig.projectId || DEFAULT_FIREBASE_CONFIG.projectId
  return `https://console.firebase.google.com/project/${id}/authentication/providers`
}
