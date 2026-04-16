import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { currentUser, getEventById, reservations } from '@/data/mockData'
import { formatMoney, spotsLeft } from '@/data/mockData'

type Tab = 'reservations' | 'profile'

export function ProfileReservations() {
  const [tab, setTab] = useState<Tab>('reservations')

  const upcoming = useMemo(() => {
    return reservations
      .filter((r) => r.status === 'confirmed' || r.status === 'waitlist')
      .map((r) => ({ r, e: getEventById(r.eventId) }))
      .filter((x): x is { r: (typeof reservations)[number]; e: NonNullable<ReturnType<typeof getEventById>> } => Boolean(x.e))
      .sort((a, b) => new Date(a.e.startsAt).getTime() - new Date(b.e.startsAt).getTime())
  }, [])

  const past = useMemo(() => {
    return reservations
      .filter((r) => r.status === 'attended' || r.status === 'cancelled')
      .map((r) => ({ r, e: getEventById(r.eventId) }))
      .filter((x): x is { r: (typeof reservations)[number]; e: NonNullable<ReturnType<typeof getEventById>> } => Boolean(x.e))
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Member</p>
          <h1 className="font-display text-3xl tracking-tight text-fg sm:text-4xl">Reservations & profile</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            Keep your training rhythm visible—upcoming sessions, history, and the basics coaches
            rely on to support you.
          </p>
        </div>
        <Button to="/sign-in" variant="secondary" className="sm:self-start">
          Switch account (demo)
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface-2/50 p-1">
        {(
          [
            { id: 'reservations' as const, label: 'Reservations' },
            { id: 'profile' as const, label: 'Profile & settings' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? 'flex-1 rounded-xl bg-surface-3 px-4 py-2 text-sm font-semibold text-fg ring-1 ring-accent/15 sm:flex-none'
                : 'flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-fg-soft transition hover:text-fg sm:flex-none'
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'reservations' ? (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
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
                        <Badge tone={r.payment === 'paid' ? 'success' : r.payment === 'pending' ? 'warning' : 'neutral'}>
                          Payment: {r.payment}
                        </Badge>
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
                    <Badge tone={r.status === 'attended' ? 'success' : 'neutral'}>
                      {r.status === 'attended' ? 'Attended' : 'Cancelled'}
                    </Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <h2 className="font-display text-lg text-fg">Payment snapshot</h2>
              </CardHeader>
              <CardBody className="space-y-3 text-sm text-fg-soft">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Autopay</span>
                  <Badge tone="success">On</Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Next statement</span>
                  <span className="font-semibold text-fg">Apr 28</span>
                </div>
                <p className="text-xs text-muted">
                  This is mock UI—no charges are processed in this preview build.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-3">
                <p className="text-sm font-semibold text-fg">Notification preferences</p>
                <p className="text-xs text-muted">
                  Fine-tune confirmations, SMS, and reminders in a dedicated screen.
                </p>
                <Button to="/settings/notifications" variant="secondary" className="w-full">
                  Open notification settings
                </Button>
              </CardBody>
            </Card>
          </aside>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="font-display text-lg text-fg">Profile</h2>
            </CardHeader>
            <CardBody className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar initials={currentUser.initials} className="size-14 text-base" />
                <div>
                  <p className="text-lg font-semibold text-fg">{currentUser.name}</p>
                  <p className="text-sm text-muted">{currentUser.email}</p>
                  <p className="mt-2 text-xs text-muted">
                    Member since{' '}
                    {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
                      new Date(currentUser.memberSince),
                    )}{' '}
                    · {currentUser.tier}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Preferred name" value={currentUser.name} />
                <Field label="Phone (SMS)" value="+1 (415) 555-0192" />
                <Field label="Emergency contact" value="Alex Ellis · +1 (415) 555-0148" />
                <Field label="Training focus" value="Strength + mobility balance" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-lg text-fg">Account</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button variant="secondary" className="w-full">
                Change password
              </Button>
              <Button variant="ghost" className="w-full">
                Log out
              </Button>
              <Button variant="danger" className="w-full">
                Delete account
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-4">
      <p className="text-xs font-semibold tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-fg">{value}</p>
    </div>
  )
}
