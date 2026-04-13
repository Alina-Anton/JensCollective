import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ToastContext, type ToastContextValue, type ToastEntry } from '@/context/toastContext'
import { cn } from '@/lib/cn'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  const idRef = useRef(0)

  const push = useCallback<ToastContextValue['push']>((toast) => {
    const id = `t-${++idRef.current}`
    setToasts((prev) => [...prev, { ...toast, id }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-6 sm:items-end sm:pb-8"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 shadow-float backdrop-blur-md transition',
              t.variant === 'success' &&
                'border-success/30 bg-surface/95 text-fg ring-1 ring-success/20',
              t.variant === 'error' &&
                'border-danger/35 bg-surface/95 text-fg ring-1 ring-danger/20',
              t.variant === 'info' &&
                'border-border bg-surface/95 text-fg ring-1 ring-accent/10',
            )}
          >
            <p className="text-sm font-medium">{t.title}</p>
            {t.description ? (
              <p className="mt-0.5 text-xs text-muted">{t.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
