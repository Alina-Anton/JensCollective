import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'warm'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
        tone === 'neutral' && 'border-border bg-surface-3 text-fg-soft',
        tone === 'accent' && 'border-accent/30 bg-accent-soft text-fg',
        tone === 'success' && 'border-success/30 bg-success-soft text-fg',
        tone === 'warning' && 'border-warning/35 bg-warning-soft text-fg',
        tone === 'danger' && 'border-danger/35 bg-danger-soft text-fg',
        tone === 'warm' && 'border-warm/35 bg-warm-soft text-fg',
        className,
      )}
      {...props}
    />
  )
}
