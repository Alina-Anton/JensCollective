import { Link } from 'react-router-dom'
import type { GymEvent } from '@/data/mockData'
import { formatMoney, spotsLeft } from '@/data/mockData'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ReserveButton } from '@/components/events/ReserveButton'
import { cn } from '@/lib/cn'
import { useToast } from '@/hooks/useToast'

function formatRange(startsAt: string, endsAt: string) {
  const s = new Date(startsAt)
  const e = new Date(endsAt)
  const day = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day.format(s)} · ${time.format(s)}–${time.format(e)}`
}

export function EventCard({
  event,
  className,
  reservedByUser,
}: {
  event: GymEvent
  className?: string
  reservedByUser?: boolean
}) {
  const left = spotsLeft(event)
  const toast = useToast()

  return (
    <Card className={cn('overflow-hidden transition hover:border-border-strong', className)}>
      <div className="relative">
        <div
          className="h-28 w-full bg-gradient-to-br from-accent-soft via-secondary-soft to-page-bottom"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(142,69,133,0.16),transparent_55%)]" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge tone="neutral">{event.category}</Badge>
          {left <= 0 ? (
            <Badge tone="danger">Full</Badge>
          ) : left <= 2 ? (
            <Badge tone="warning">Few spots left</Badge>
          ) : (
            <Badge tone="success">{left} spots left</Badge>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <Link
              to={`/events/${event.id}`}
              className="block font-display text-lg leading-snug tracking-tight text-fg decoration-transparent underline-offset-4 transition hover:underline hover:decoration-accent/50"
            >
              {event.title}
            </Link>
            <p className="text-sm text-muted">{event.description}</p>
          </div>
          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-xs font-semibold tracking-wide text-fg-soft">Price</p>
            <p className="mt-1 text-sm font-semibold text-fg">{formatMoney(event.priceCents)}</p>
          </div>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-muted">When</dt>
            <dd className="mt-1 text-fg-soft">{formatRange(event.startsAt, event.endsAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-muted">Where</dt>
            <dd className="mt-1 text-fg-soft">{event.location}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-muted">Host</dt>
            <dd className="mt-1 text-fg-soft">
              {event.host.name}
              <span className="block text-xs text-muted">{event.host.title}</span>
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted sm:hidden">Price: {formatMoney(event.priceCents)}</p>
          <ReserveButton
            spotsLeft={left}
            waitlistEnabled={event.waitlistEnabled}
            defaultReserved={reservedByUser}
            onReserve={(mode) => {
              toast.push({
                variant: 'success',
                title: mode === 'waitlist' ? 'You are on the waitlist' : 'Reservation confirmed',
                description: `${event.title} — you will receive a calendar invite shortly.`,
              })
            }}
          />
        </div>
      </div>
    </Card>
  )
}
