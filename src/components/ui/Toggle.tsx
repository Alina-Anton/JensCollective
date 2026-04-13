import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  description?: string
}

export function Toggle({ label, description, className, id, ...props }: ToggleProps) {
  const toggleId = id ?? label.replaceAll(' ', '-').toLowerCase()
  return (
    <label
      htmlFor={toggleId}
      className={cn(
        'flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-border bg-surface-2/60 px-4 py-3 transition hover:border-border-strong hover:bg-surface-2',
        className,
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-fg">{label}</span>
        {description ? <span className="mt-1 block text-xs text-muted">{description}</span> : null}
      </span>
      <span className="relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center">
        <input id={toggleId} type="checkbox" className="peer sr-only" {...props} />
        <span
          className={cn(
            'h-7 w-12 rounded-full border border-border bg-surface-3 transition peer-checked:border-accent/40 peer-checked:bg-accent-soft',
          )}
          aria-hidden
        />
        <span
          className={cn(
            'pointer-events-none absolute left-1 top-1 size-5 rounded-full bg-fg/80 shadow-sm transition peer-checked:translate-x-5 peer-checked:bg-accent',
          )}
          aria-hidden
        />
      </span>
    </label>
  )
}
