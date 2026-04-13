import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'

export function StatsCard({
  label,
  value,
  hint,
  icon,
  trend,
  className,
}: {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
  trend?: { label: string; positive?: boolean }
  className?: string
}) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
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
        ) : null}
      </div>
    </Card>
  )
}
