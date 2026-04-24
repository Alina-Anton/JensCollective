import type { FirebaseError } from 'firebase/app'

function parts(err: unknown): { code: string; message: string } {
  if (!err || typeof err !== 'object') return { code: '', message: '' }
  const o = err as FirebaseError & { message?: string }
  return {
    code: typeof o.code === 'string' ? o.code : '',
    message: typeof o.message === 'string' ? o.message : '',
  }
}

export function messageForAuthError(err: unknown): string {
  const { code, message } = parts(err)
  const blob = `${code} ${message}`.toUpperCase()

  if (
    code === 'auth/configuration-not-found' ||
    blob.includes('CONFIGURATION_NOT_FOUND')
  ) {
    return 'Firebase Authentication is not turned on for this project yet. In the Firebase console open Authentication, click Get started, then under Sign-in method enable Email/Password, and try again.'
  }

  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try signing in instead.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled. In Firebase Console → Authentication → Sign-in method, turn on Email/Password.'
    case 'auth/password-reset-local-only':
      return 'Password reset email is only available when using Firebase sign-in (set VITE_AUTH_MODE=firebase and configure the project). For local accounts, sign out and create a new account if you forgot your password.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
