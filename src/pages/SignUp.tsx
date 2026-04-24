import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { getAuthMode } from '@/lib/authMode'
import { messageForAuthError } from '@/lib/authErrors'
import { firebaseConsoleAuthenticationUrl } from '@/lib/firebase'
import { useToast } from '@/hooks/useToast'

export function SignUp() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, signUpWithEmail } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (name.trim().length < 2) next.name = 'Please enter your full name.'
    if (!email.includes('@')) next.email = 'Please enter a valid email address.'
    if (password.length < 8) next.password = 'Use at least 8 characters.'
    if (!agreed) next.agreed = 'Please confirm you agree to the member guidelines.'
    setErrors(next)
    if (Object.keys(next).length) {
      toast.push({
        variant: 'error',
        title: 'We need a bit more detail',
        description: 'Fix the fields below to continue.',
      })
      return
    }
    setLoading(true)
    try {
      await signUpWithEmail(email, password, name.trim())
      toast.push({
        variant: 'success',
        title: 'Account created',
        description: 'You are signed in. Welcome to Jen’s Collective.',
      })
      navigate('/', { replace: true })
    } catch (err) {
      toast.push({
        variant: 'error',
        title: 'Could not create account',
        description: messageForAuthError(err),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-transparent">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-8 flex justify-center">
          <Logo to="/" />
        </div>

        <div className="rounded-2xl border border-border bg-surface/95 p-6 shadow-card backdrop-blur-sm sm:p-8">
          <div className="space-y-1 text-center">
            <h1 className="font-display text-2xl tracking-tight text-fg">Create your account</h1>
            <p className="text-sm text-muted">
              Use your email and a strong password. Accounts are stored in this browser only (local
              mode) unless your host sets Firebase auth.
            </p>
            {getAuthMode() === 'firebase' ? (
              <p className="mt-3 text-left text-xs leading-relaxed text-muted">
                First-time Firebase setup: open{' '}
                <a
                  href={firebaseConsoleAuthenticationUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-accent underline-offset-2 hover:underline"
                >
                  Authentication in the Firebase console
                </a>
                , choose <span className="text-fg-soft">Get started</span> if prompted, then enable{' '}
                <span className="text-fg-soft">Email/Password</span> under Sign-in method.
              </p>
            ) : null}
          </div>

          <form className="mt-8 space-y-4 text-left" onSubmit={onSubmit}>
            <Input
              label="Full name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="Jordan Ellis"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              hint="This is the email you will use to sign in."
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              hint="At least 8 characters."
            />

            <label className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-3 text-xs text-muted">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 size-4 rounded border-border bg-surface accent-accent"
              />
              <span>
                I agree to the{' '}
                <button type="button" className="font-semibold text-fg-soft hover:text-fg">
                  member guidelines
                </button>{' '}
                and understand Jen’s Collective is for verified members only.
              </span>
            </label>
            {errors.agreed ? <p className="text-xs font-medium text-danger">{errors.agreed}</p> : null}

            <Button type="submit" className="w-full" loading={loading}>
              Create account
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
            Already have an account?{' '}
            <Link className="font-semibold text-fg-soft hover:text-fg" to="/sign-in">
              Sign in
            </Link>
          </p>
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
