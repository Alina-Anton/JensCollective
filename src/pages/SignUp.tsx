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
import {
  hasApprovedMemberRequest,
  markApprovedRequestActivated,
  upsertPendingMemberRequest,
} from '@/lib/memberRequests'

export function SignUp() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, signUpWithEmail } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [referredBy, setReferredBy] = useState('')
  const [details, setDetails] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  async function onSubmitRequest(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (name.trim().length < 2) next.name = 'Please enter your full name.'
    if (!email.includes('@')) next.email = 'Please enter a valid email address.'
    if (password.length < 8) next.password = 'Use at least 8 characters.'
    if (referredBy.trim().length < 2) next.referredBy = 'Please tell us who referred you.'
    if (details.trim().length < 4) next.details = 'Please add a bit more detail.'
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
      const approved = await hasApprovedMemberRequest(email)
      if (!approved) {
        upsertPendingMemberRequest({
          name,
          referredBy,
          details,
          email: email.trim(),
        })
        toast.push({
          variant: 'success',
          title: 'Request submitted',
          description: 'Your request is pending admin approval. Come back after approval to finish account creation.',
        })
        return
      }

      await signUpWithEmail(email, password, name.trim())
      markApprovedRequestActivated(email)
      toast.push({
        variant: 'success',
        title: 'Account created',
        description: 'Your request was approved. Welcome to Jen’s Collective.',
      })
      navigate('/', { replace: true })
    } catch (err) {
      toast.push({
        variant: 'error',
        title: 'Could not continue',
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
              Use your email and a strong password. Accounts sync across devices with Firebase auth.
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

          <form className="mt-8 space-y-4 text-left" onSubmit={onSubmitRequest}>
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
              label="Password (used after approval)"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              hint="At least 8 characters."
            />
            <Input
              label="Who Reffered you"
              name="referredBy"
              value={referredBy}
              onChange={(e) => setReferredBy(e.target.value)}
              error={errors.referredBy}
            />
            <label className="block text-sm">
              <span className="mb-1 block text-fg-soft">Details</span>
              <textarea
                name="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="min-h-24 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg outline-none ring-accent/30 transition focus:ring-2"
              />
              {errors.details ? <span className="mt-1 block text-xs font-medium text-danger">{errors.details}</span> : null}
            </label>

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
              Submit request
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
