import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

export function Logo({
  className,
  to = '/',
  variant = 'default',
}: {
  className?: string
  to?: string
  /** Light text/mark for hero areas on the pastel gradient */
  variant?: 'default' | 'onGradient'
}) {
  const onGradient = variant === 'onGradient'

  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'relative inline-flex size-9 items-center justify-center rounded-xl border shadow-[0_1px_0_rgba(0,0,0,0.04)_inset]',
          onGradient
            ? 'border-white/40 bg-white/15 shadow-none'
            : 'border-border bg-surface',
        )}
      >
        <span
          className={cn(
            'font-display text-sm font-semibold tracking-tight',
            onGradient ? 'text-white' : 'text-accent',
          )}
        >
          JC
        </span>
        <span
          className={cn(
            'pointer-events-none absolute inset-0 rounded-xl ring-1 transition',
            onGradient ? 'ring-white/25 group-hover:ring-white/45' : 'ring-accent/10 group-hover:ring-accent/30',
          )}
        />
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            'block font-display text-base font-semibold tracking-tight',
            onGradient ? 'text-white' : 'text-fg',
          )}
        >
          Jen’s Collective
        </span>
        <span
          className={cn(
            'block text-[11px] font-medium tracking-wide',
            onGradient ? 'text-white/75' : 'text-muted',
          )}
        >
          Private community
        </span>
      </span>
    </Link>
  )
}
