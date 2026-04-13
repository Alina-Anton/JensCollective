import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'

export function SignUp() {
  const toast = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (name.trim().length < 2) next.name = 'Please enter your full name.'
    if (!email.includes('@')) next.email = 'Please enter a valid email address.'
    if (password.length < 10)
      next.password = 'Use at least 10 characters, including a number and symbol.'
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
    window.setTimeout(() => {
      setLoading(false)
      toast.push({
        variant: 'success',
        title: 'Invite request received',
        description: 'GymBoard is private—an admin will confirm your membership shortly.',
      })
    }, 950)
  }

  return (
    <div className="min-h-dvh bg-transparent">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-8 flex justify-center">
          <Logo to="/" />
        </div>

        <div className="rounded-2xl border border-border bg-surface/95 p-6 shadow-card backdrop-blur-sm sm:p-8">
          <div className="space-y-1 text-center">
            <h1 className="font-display text-2xl tracking-tight text-fg">Request access</h1>
            <p className="text-sm text-muted">
              GymBoard is invite-only. Tell us who you are—we will route this to your gym admin.
            </p>
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
              hint="Prefer your personal email—less likely to change jobs."
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            <label className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-3 text-xs text-muted">
              <input type="checkbox" className="mt-0.5 size-4 rounded border-border bg-surface accent-accent" />
              <span>
                I agree to the{' '}
                <button type="button" className="font-semibold text-fg-soft hover:text-fg">
                  member guidelines
                </button>{' '}
                and understand Jen’s Collective is for verified members only.
              </span>
            </label>

            <Button type="submit" className="w-full" loading={loading}>
              Submit request
            </Button>

            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-border-strong" />
              <span className="shrink-0 text-[11px] font-medium tracking-wide text-muted">
                Or continue with
              </span>
              <span className="h-px flex-1 bg-border-strong" />
            </div>

            <Button type="button" variant="secondary" className="w-full">
              <span className="inline-flex items-center gap-2">
                <GoogleMark />
                Continue with Google
              </span>
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            Already approved?{' '}
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
