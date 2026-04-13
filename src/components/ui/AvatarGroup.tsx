import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'

export function AvatarGroup({
  people,
  max = 4,
  className,
}: {
  people: { name: string; initials: string }[]
  max?: number
  className?: string
}) {
  const shown = people.slice(0, max)
  const extra = Math.max(0, people.length - max)
  return (
    <div className={cn('flex items-center', className)}>
      {shown.map((p, idx) => (
        <Avatar
          key={p.name}
          initials={p.initials}
          title={p.name}
          className={cn('-ml-2 first:ml-0 ring-2 ring-surface', idx === 0 && 'ml-0')}
        />
      ))}
      {extra > 0 ? (
        <div className="-ml-2 inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface-2 text-[11px] font-semibold text-muted ring-2 ring-surface">
          +{extra}
        </div>
      ) : null}
    </div>
  )
}
