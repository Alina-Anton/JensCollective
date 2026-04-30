import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { getEventById, reservations, formatMoney, spotsLeft } from '@/data/mockData'
import { useAuth } from '@/hooks/useAuth'
import { getUserReservations, subscribeUserReservations } from '@/lib/userReservations'

export function ReservationsPage() {
  const { user } = useAuth()
  const [version, setVersion] = useState(0)
  useEffect(() => subscribeUserReservations(() => setVersion((v) => v + 1)), [])

  const allReservations = useMemo(() => {
    void version
    const byEvent = new Map<string, (typeof reservations)[number]>()
    for (const r of reservations) byEvent.set(r.eventId, r)
    for (const r of getUserReservations(user?.uid ?? undefined)) byEvent.set(r.eventId, r)
    return Array.from(byEvent.values())
  }, [version, user?.uid])

  const upcoming = useMemo(() => {
    return allReservations
      .filter((r) => r.status === 'confirmed' || r.status === 'waitlist')
      .map((r) => ({ r, e: getEventById(r.eventId) }))
      .filter(
        (x): x is { r: (typeof reservations)[number]; e: NonNullable<ReturnType<typeof getEventById>> } =>
          Boolean(x.e),
      )
      .sort((a, b) => new Date(a.e.startsAt).getTime() - new Date(b.e.startsAt).getTime())
  }, [allReservations])

  const past = useMemo(() => {
    return allReservations
      .filter((r) => r.status === 'attended' || r.status === 'cancelled')
      .map((r) => ({ r, e: getEventById(r.eventId) }))
      .filter(
        (x): x is { r: (typeof reservations)[number]; e: NonNullable<ReturnType<typeof getEventById>> } =>
          Boolean(x.e),
      )
  }, [allReservations])

  return (
    <div className="space-y-8">
      <div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Keep your training rhythm visible—upcoming sessions and history you can trust.
        </p>
      </div>

      <div className="space-y-6">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-display text-lg text-fg">Upcoming</h2>
              <p className="mt-1 text-xs text-muted">Confirmed and waitlisted sessions.</p>
            </CardHeader>
            <CardBody className="space-y-4">
              {upcoming.length ? (
                upcoming.map(({ r, e }) => (
                  <div
                    key={r.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-fg">{e.title}</p>
                        {r.status === 'waitlist' ? (
                          <Badge tone="warning">Waitlist</Badge>
                        ) : (
                          <Badge tone="success">Confirmed</Badge>
                        )}
                        <Badge tone="neutral">{formatMoney(e.priceCents)}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {new Intl.DateTimeFormat('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        }).format(new Date(e.startsAt))}{' '}
                        · {e.location}
                      </p>
                      <p className="mt-2 text-xs text-muted">
                        {spotsLeft(e)} public spots remaining · max {e.maxSpots}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      <Button to={`/events/${e.id}`} variant="secondary" className="w-full sm:w-auto">
                        View event
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">No upcoming reservations.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-lg text-fg">Past</h2>
              <p className="mt-1 text-xs text-muted">Attendance history for programming continuity.</p>
            </CardHeader>
            <CardBody className="space-y-3">
              {past.map(({ r, e }) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-surface/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-fg">{e.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }).format(new Date(e.startsAt))}
                    </p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  )
}

