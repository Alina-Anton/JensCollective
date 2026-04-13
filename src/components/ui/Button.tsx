import { forwardRef, type ButtonHTMLAttributes, type MouseEvent } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  variant?: Variant
  loading?: boolean
  to?: LinkProps['to']
  onClick?: (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', loading, disabled, children, to, onClick, ...props },
  ref,
) {
  const isDisabled = disabled || loading
  const styles = cn(
    'inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-45',
    variant === 'primary' &&
      'bg-accent text-on-accent shadow-[0_1px_0_rgba(255,255,255,0.35)_inset] hover:bg-[color-mix(in_oklab,var(--color-accent)_88%,black))] active:translate-y-px',
    variant === 'secondary' &&
      'border-2 border-accent bg-transparent text-accent hover:bg-accent-soft hover:border-accent',
    variant === 'ghost' && 'text-fg-soft hover:bg-surface-2 hover:text-fg',
    variant === 'danger' && 'border border-danger/35 bg-danger-soft text-fg hover:border-danger/50',
    className,
  )

  const content = (
    <>
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
            aria-hidden
          />
          <span className="sr-only">Loading</span>
        </span>
      ) : null}
      {children}
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        className={cn(styles, isDisabled && 'pointer-events-none opacity-45')}
        aria-disabled={isDisabled}
        onClick={(e) => {
          if (isDisabled) e.preventDefault()
          onClick?.(e)
        }}
      >
        {content}
      </Link>
    )
  }

  return (
    <button ref={ref} disabled={isDisabled} className={styles} onClick={onClick} {...props}>
      {content}
    </button>
  )
})
