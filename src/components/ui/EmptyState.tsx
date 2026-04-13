import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-2/40 px-6 py-14 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-3 text-accent">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-lg text-fg">{title}</p>
      <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
