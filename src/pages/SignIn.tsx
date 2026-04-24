import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { getAuthMode } from '@/lib/authMode'
import { messageForAuthError } from '@/lib/authErrors'
import { useToast } from '@/hooks/useToast'

export function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { user, signInWithEmail, sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const fromPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  useEffect(() => {
    if (user) navigate(fromPath, { replace: true })
  }, [user, fromPath, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!email.includes('@')) next.email = 'Please enter a valid email address.'
    if (password.length < 8) next.password = 'Password must be at least 8 characters.'
    setErrors(next)
    if (Object.keys(next).length) {
      toast.push({
        variant: 'error',
        title: 'Check the highlighted fields',
        description: 'We could not sign you in with the information provided.',
      })
      return
    }
    setLoading(true)
    try {
      await signInWithEmail(email, password)
      toast.push({
        variant: 'success',
        title: 'Welcome back',
        description: 'Redirecting to your home…',
      })
      navigate(fromPath, { replace: true })
    } catch (err) {
      toast.push({
        variant: 'error',
        title: 'Sign-in failed',
        description: messageForAuthError(err),
      })
    } finally {
      setLoading(false)
    }
  }

  async function onForgotPassword() {
    if (!email.includes('@')) {
      setErrors((prev) => ({ ...prev, email: 'Enter your email above, then tap forgot password again.' }))
      toast.push({
        variant: 'error',
        title: 'Email required',
        description: 'Enter the email for your account, then request a reset link.',
      })
      return
    }
    setResetLoading(true)
    try {
      await sendPasswordReset(email)
      toast.push({
        variant: 'success',
        title: 'Check your inbox',
        description: 'If an account exists for that email, we sent a reset link.',
      })
    } catch (err) {
      toast.push({
        variant: 'error',
        title: 'Could not send reset email',
        description: messageForAuthError(err),
      })
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-transparent">
      <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden border-r border-border lg:block">
          <div className="absolute inset-0 bg-gradient-to-b from-page-top to-page-bottom" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(142,69,133,0.2),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_80%_40%,rgba(163,216,244,0.55),transparent_55%)]" />
          <div className="relative flex h-full flex-col justify-between p-10">
            <Logo to="/" variant="onGradient" />
            <div className="max-w-md space-y-4">
              <p className="font-display text-3xl font-semibold leading-tight tracking-tight text-accent text-balance">
                A calmer way to run a high-trust gym community.
              </p>
              <p className="text-sm font-medium leading-relaxed text-white drop-shadow-sm">
                Jen’s Collective helps members discover sessions, reserve fairly, and stay
                connected—without the noise of public social feeds.
              </p>
            </div>
            <p className="text-xs font-medium text-white/65">
              {getAuthMode() === 'firebase'
                ? 'Secure sign-in with Firebase Authentication'
                : 'Local sign-in — your credentials stay on this device'}
            </p>
          </div>
        </aside>

        <div className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="flex items-center justify-between lg:hidden">
              <Logo to="/" />
            </div>

            <div className="rounded-2xl border border-border bg-surface/95 p-6 shadow-card backdrop-blur-sm sm:p-8">
              <div className="space-y-1">
                <h1 className="font-display text-2xl tracking-tight text-fg">Sign in</h1>
                <p className="text-sm text-muted">
                  Access your member portal, reservations, and community updates.
                </p>
              </div>

              <form className="mt-8 space-y-4" onSubmit={onSubmit}>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  hint="Use the email you registered with."
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />

                <div className="flex items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs text-fg-soft">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-border bg-surface accent-accent"
                      defaultChecked
                    />
                    Remember this device
                  </label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-accent hover:underline disabled:opacity-45"
                    disabled={resetLoading}
                    onClick={() => void onForgotPassword()}
                  >
                    Forgot password
                  </button>
                </div>

                <Button type="submit" className="w-full" loading={loading}>
                  Continue
                </Button>

                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-border-strong" />
                  <span className="shrink-0 text-[11px] font-medium tracking-wide text-muted">
                    Or continue with
                  </span>
                  <span className="h-px flex-1 bg-border-strong" />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() =>
                    toast.push({
                      variant: 'error',
                      title: 'Not available yet',
                      description: 'Google sign-in is not enabled. Use email and password.',
                    })
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <GoogleMark />
                    Continue with Google
                  </span>
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted">
                New to Jen’s Collective?{' '}
                <Link className="font-semibold text-fg-soft hover:text-fg" to="/sign-up">
                  Create an account
                </Link>
              </p>
            </div>

            <p className="text-center text-[11px] text-muted">
              By continuing you agree to member guidelines and privacy practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.86 11.86 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
      />
    </svg>
  )
}
