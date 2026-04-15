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
    <Link to={to} className={cn('group inline-flex items-center', className)}>
      <span className="leading-tight">
        <span
          className={cn(
            'block text-[22px] leading-none [font-family:"Dancing_Script",cursive]',
            onGradient ? 'text-white' : 'text-accent/90',
          )}
        >
          Jen’s Collective
        </span>
        <span
          className={cn(
            'mt-0.5 block text-[11px] font-medium tracking-wide',
            onGradient ? 'text-white/80' : 'text-muted',
          )}
        >
          Private Community
        </span>
      </span>
    </Link>
  )
}
