import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'

export function StatsCard({
  label,
  value,
  hint,
  icon,
  actionTo,
  actionLabel = 'Open',
  trend,
  className,
}: {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
  actionTo?: string
  actionLabel?: string
  trend?: { label: string; positive?: boolean }
  className?: string
}) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-muted">{label}</p>
          <p className="mt-2 font-display text-2xl tracking-tight text-fg">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
          {trend ? (
            <p
              className={cn(
                'mt-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                trend.positive
                  ? 'border-success/25 bg-success-soft text-fg'
                  : 'border-border bg-surface-3 text-fg-soft',
              )}
            >
              {trend.label}
            </p>
          ) : null}
        </div>
        {icon ? (
          <div className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-surface-3 text-accent">
            {icon}
          </div>
        ) : actionTo ? (
          <Link
            to={actionTo}
            aria-label={actionLabel}
            className="inline-flex items-center justify-center self-center px-1 text-accent transition hover:scale-110 hover:animate-pulse hover:text-[color-mix(in_oklab,var(--color-accent)_88%,black)]"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ) : null}
      </div>
    </Card>
  )
}
