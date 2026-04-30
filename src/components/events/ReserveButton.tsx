import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

type ReserveState = 'idle' | 'loading' | 'reserved' | 'waitlist' | 'full'

export function ReserveButton({
  spotsLeft,
  waitlistEnabled,
  defaultReserved = false,
  className,
  onReserve,
  onCancel,
}: {
  spotsLeft: number
  waitlistEnabled: boolean
  defaultReserved?: boolean
  className?: string
  onReserve?: (mode: 'reserve' | 'waitlist') => void
  onCancel?: () => void
}) {
  const [state, setState] = useState<ReserveState>(() => {
    if (spotsLeft <= 0 && !waitlistEnabled) return 'full'
    if (defaultReserved) return 'reserved'
    return 'idle'
  })

  async function handleClick() {
    if (state === 'full') return
    if (state === 'reserved') return
    setState('loading')
    await new Promise((r) => window.setTimeout(r, 900))
    if (spotsLeft <= 0 && waitlistEnabled) {
      setState('waitlist')
      onReserve?.('waitlist')
      return
    }
    setState('reserved')
    onReserve?.('reserve')
  }

  if (state === 'full') {
    return (
      <Button variant="secondary" disabled className={cn('w-full sm:w-auto', className)}>
        Class full
      </Button>
    )
  }

  if (state === 'reserved') {
    return (
      <Button
        variant="secondary"
        type="button"
        className={cn('w-full sm:w-auto', className)}
        onClick={() => {
          setState('idle')
          onCancel?.()
        }}
      >
        Cancel my reservation
      </Button>
    )
  }

  if (state === 'waitlist') {
    return (
      <Button variant="secondary" disabled className={cn('w-full sm:w-auto', className)}>
        On waitlist
      </Button>
    )
  }

  const label =
    spotsLeft <= 0 && waitlistEnabled ? 'Join waitlist' : spotsLeft <= 2 ? 'Reserve last spots' : 'Reserve spot'

  return (
    <Button
      variant="primary"
      loading={state === 'loading'}
      onClick={handleClick}
      className={cn('w-full sm:w-auto', className)}
    >
      {label}
    </Button>
  )
}
