import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="text-xs font-medium tracking-wide text-fg-soft">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'h-11 w-full rounded-xl border bg-surface px-3 text-sm text-fg shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] outline-none transition placeholder:text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/25',
          error ? 'border-danger/50 ring-1 ring-danger/20' : 'border-border',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
})
