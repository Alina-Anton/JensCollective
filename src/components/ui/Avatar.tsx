import { cn } from '@/lib/cn'

export function Avatar({
  initials,
  src,
  className,
  title,
}: {
  initials: string
  src?: string | null
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
      {src ? (
        <img src={src} alt={title ?? 'User avatar'} className="size-full rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}
