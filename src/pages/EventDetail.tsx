import { useParams } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { AvatarGroup } from '@/components/ui/AvatarGroup'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReserveButton } from '@/components/events/ReserveButton'
import { activeMembers, formatMoney, getEventById, reservations, spotsLeft } from '@/data/mockData'
import { formatDateTimeRange } from '@/lib/format'
import { useToast } from '@/hooks/useToast'

const reservedSet = new Set(
  reservations.filter((r) => r.status === 'confirmed' || r.status === 'waitlist').map((r) => r.eventId),
)

const chatPreview = [
  {
    id: 'c1',
    who: 'Sam Rivera',
    when: '2h ago',
    text: 'Will there be a scaling option for the ring work? Wrist has been cranky.',
  },
  {
    id: 'c2',
    who: 'Coach Avery',
    when: '1h ago',
    text: 'Yes—substitute strict hanging knee raises or plank waves. I will set up both stations.',
  },
  {
    id: 'c3',
    who: 'Priya Shah',
    when: '45m ago',
    text: 'Driving in from the north loop—if anyone wants to carpool, ping me.',
  },
]

export function EventDetail() {
  const { eventId } = useParams()
  const toast = useToast()
  const event = eventId ? getEventById(eventId) : undefined

  if (!event) {
    return (
      <EmptyState
        title="This event is not available"
        description="It may have been removed, or the link is outdated. Browse the board to find something else that fits your week."
        action={
          <Button to="/events" variant="primary">
            Back to events
          </Button>
        }
      />
    )
  }

  const left = spotsLeft(event)
  const { dayLine, timeLine } = formatDateTimeRange(event.startsAt, event.endsAt)
  const reservedByUser = reservedSet.has(event.id)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button to="/events" variant="ghost" className="h-10 px-3">
          ← Events board
        </Button>
        <div className="flex flex-wrap gap-2">
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

      <section className="overflow-hidden rounded-3xl border border-border bg-surface/95 shadow-card">
        <div className="relative">
          <div className="h-44 bg-gradient-to-br from-accent-soft via-secondary-soft to-page-bottom sm:h-56" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(142,69,133,0.2),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_90%_30%,rgba(163,216,244,0.55),transparent_55%)]" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-fg-soft/90 uppercase">Featured session</p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl tracking-tight text-fg sm:text-4xl">
              {event.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{event.description}</p>
          </div>
        </div>

        <div className="grid gap-6 border-t border-border p-6 sm:grid-cols-3 sm:p-8">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted">Date</p>
            <p className="mt-2 text-sm font-semibold text-fg">{dayLine}</p>
            <p className="mt-1 text-sm text-fg-soft">{timeLine}</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted">Location</p>
            <p className="mt-2 text-sm font-semibold text-fg">{event.location}</p>
            <p className="mt-1 text-sm text-muted">Arrive 10 minutes early to settle in.</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted">Host</p>
            <div className="mt-2 flex items-center gap-3">
              <Avatar initials={event.host.initials} title={event.host.name} className="size-10" />
              <div>
                <p className="text-sm font-semibold text-fg">{event.host.name}</p>
                <p className="text-xs text-muted">{event.host.title}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="font-display text-lg text-fg">About this session</h2>
            </CardHeader>
            <CardBody className="space-y-4 text-sm leading-relaxed text-fg-soft">
              <p>{event.longDescription}</p>
              <p className="text-muted">
                Visual moodboard for this class: <span className="text-fg-soft">{event.imageHint}</span>
                .
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg text-fg">Discussion</h2>
                <p className="mt-1 text-xs text-muted">Coach-moderated thread · preview</p>
              </div>
              <Badge tone="warm">Respect-first</Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              {chatPreview.map((m) => (
                <div key={m.id} className="rounded-2xl border border-border bg-surface/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-fg">{m.who}</p>
                    <p className="text-[11px] font-semibold tracking-wide text-muted">{m.when}</p>
                  </div>
                  <p className="mt-2 text-sm text-fg-soft">{m.text}</p>
                </div>
              ))}
              <Button variant="secondary" className="w-full">
                Open full thread
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-lg text-fg">Cancellation policy</h2>
            </CardHeader>
            <CardBody className="space-y-3 text-sm text-fg-soft">
              <p>
                Free cancellation until 12 hours before start. Late cancellations may be charged a
                no-show fee unless a waitlist member can take your spot.
              </p>
              <p className="text-muted">
                If you are waitlisted, you will be auto-promoted and notified by email and SMS if
                enabled.
              </p>
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted">Investment</p>
                  <p className="mt-2 font-display text-2xl text-fg">{formatMoney(event.priceCents)}</p>
                  <p className="mt-1 text-xs text-muted">Tax included where applicable.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold tracking-wide text-muted">Attending</p>
                  <p className="mt-2 text-2xl font-semibold text-fg">{event.reservedCount}</p>
                  <p className="text-xs text-muted">of {event.maxSpots}</p>
                </div>
              </div>

              <ReserveButton
                spotsLeft={left}
                waitlistEnabled={event.waitlistEnabled}
                defaultReserved={reservedByUser}
                className="w-full"
                onReserve={(mode) => {
                  toast.push({
                    variant: 'success',
                    title: mode === 'waitlist' ? 'You are on the waitlist' : 'Reservation confirmed',
                    description: `${event.title} — calendar invite queued.`,
                  })
                }}
              />

              {left <= 0 && event.waitlistEnabled ? (
                <p className="text-xs text-muted">
                  Waitlist members are promoted in order. You can leave the waitlist anytime from
                  your reservations tab.
                </p>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-lg text-fg">Who is going</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <AvatarGroup people={activeMembers} max={5} />
              <p className="text-xs text-muted">
                Names are visible to members only. Hosts may pin a few attendees for accountability
                pairings.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-lg text-fg">Payment status</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface/40 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-fg">Member balance</p>
                  <p className="mt-1 text-xs text-muted">Placeholder for Stripe / gym billing</p>
                </div>
                <Badge tone="success">In good standing</Badge>
              </div>
              <p className="text-xs text-muted">
                When payments go live, you will see per-event charges, receipts, and credits here.
              </p>
            </CardBody>
          </Card>

          <Button to="/me" variant="secondary" className="w-full">
            Manage in reservations
          </Button>
        </aside>
      </div>
    </div>
  )
}
