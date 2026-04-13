import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { EventCard } from '@/components/events/EventCard'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { activityFeed, currentUser, events, reservations } from '@/data/mockData'
import { formatRelative } from '@/lib/format'

const reservedSet = new Set(
  reservations.filter((r) => r.status === 'confirmed' || r.status === 'waitlist').map((r) => r.eventId),
)

export function Dashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 780)
    return () => window.clearTimeout(t)
  }, [])

  const upcoming = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .slice(0, 3)
  }, [])

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Home</p>
          <h1 className="font-display text-3xl tracking-tight text-fg sm:text-4xl">
            Good evening, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            Your week is shaping up thoughtfully—two reservations confirmed, one waitlist, and a
            community note pinned for Saturday.
          </p>
        </div>
        <Button to="/events/new" variant="primary" className="sm:self-start">
          Create event
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="This week"
          value="4 sessions"
          hint="Across strength, conditioning, and mobility."
          trend={{ label: '+1 vs last week', positive: true }}
          icon={<CalendarIcon />}
        />
        <StatsCard
          label="Community pulse"
          value="18 updates"
          hint="Posts, announcements, and coach notes."
          trend={{ label: 'Healthy engagement', positive: true }}
          icon={<WaveIcon />}
        />
        <StatsCard
          label="Attendance streak"
          value="6 weeks"
          hint="Keep it gentle—recovery counts too."
          icon={<LeafIcon />}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl text-fg">Upcoming events</h2>
              <p className="mt-1 text-sm text-muted">Curated for Harbor Line members.</p>
            </div>
            <Link
              to="/events"
              className="text-sm font-semibold text-accent hover:text-[color-mix(in_oklab,var(--color-accent)_85%,white)]"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} reservedByUser={reservedSet.has(e.id)} />
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardBody className="space-y-4">
              <div>
                <h2 className="font-display text-lg text-fg">Recent activity</h2>
                <p className="mt-1 text-xs text-muted">A quiet feed of meaningful moments.</p>
              </div>
              <ul className="space-y-3">
                {activityFeed.map((a) => (
                  <li key={a.id} className="rounded-xl border border-border bg-surface/40 p-3">
                    <p className="text-sm text-fg-soft">
                      <span className="font-semibold text-fg">{a.user}</span>{' '}
                      <span className="text-muted">{a.action}</span>{' '}
                      <span className="font-medium text-fg">{a.target}</span>
                    </p>
                    <p className="mt-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
                      {formatRelative(a.at)}
                    </p>
                  </li>
                ))}
              </ul>
              <Button to="/community" variant="secondary" className="w-full">
                Open community
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-3">
              <p className="text-sm font-semibold text-fg">Coaches on deck</p>
              <p className="text-xs text-muted">
                Mira is prioritizing mobility resets; Noah is taking new strength assessments on
                Thursdays.
              </p>
              <Button to="/events" variant="ghost" className="w-full justify-center">
                Browse full schedule
              </Button>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function WaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 14c3-6 5 6 8 0s5 6 8-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LeafIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21c6-6 6-14 6-14s-8 0-14 6c3 3 5 5 8 8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
