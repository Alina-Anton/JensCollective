import { useParams } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { AvatarGroup } from '@/components/ui/AvatarGroup'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReserveButton } from '@/components/events/ReserveButton'
import { activeMembers, getEventById, reservations, spotsLeft } from '@/data/mockData'
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

      <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-card">
        <div className="p-6 sm:p-8">
          <h1 className="mt-2 max-w-3xl font-display text-3xl tracking-tight text-fg sm:text-4xl">
            {event.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{event.description}</p>
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

        <div className="space-y-3 border-t border-border p-6 sm:p-8">
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
              Waitlist members are promoted in order. You can leave the waitlist anytime from your
              reservations tab.
            </p>
          ) : null}
        </div>
      </section>

      <div className="space-y-8">
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
            </div>
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
    </div>
  )
}
