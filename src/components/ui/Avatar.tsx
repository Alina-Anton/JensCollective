import { cn } from '@/lib/cn'

export function Avatar({
  initials,
  className,
  title,
}: {
  initials: string
  className?: string
  title?: string
}) {
  return (
    <div
      title={title}
      className={cn(
        'inline-flex size-9 select-none items-center justify-center rounded-full border border-border bg-surface-3 text-xs font-semibold tracking-wide text-fg-soft',
        className,
      )}
    >
      {initials}
    </div>
  )
}
