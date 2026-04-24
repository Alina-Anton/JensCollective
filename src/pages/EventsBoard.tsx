import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { EventCategory } from '@/data/mockData'
import { getMergedEvents, reservations } from '@/data/mockData'
import { subscribeUserCreatedEvents } from '@/lib/userCreatedEvents'
import { EventCard } from '@/components/events/EventCard'
import { FilterBar } from '@/components/events/FilterBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { EventCardSkeleton } from '@/components/ui/Skeleton'
const reservedSet = new Set(
  reservations.filter((r) => r.status === 'confirmed' || r.status === 'waitlist').map((r) => r.eventId),
)

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

function endOfWeek(d: Date) {
  const x = new Date(d)
  const day = x.getDay()
  const diff = (day + 6) % 7
  x.setDate(x.getDate() - diff + 6)
  x.setHours(23, 59, 59, 999)
  return x.getTime()
}

export function EventsBoard() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<EventCategory | 'All'>('All')
  const [datePreset, setDatePreset] = useState<'any' | 'week' | 'today'>('any')
  const [busy, setBusy] = useState(true)
  const [catalogVersion, setCatalogVersion] = useState(0)

  useEffect(() => {
    const t = window.setTimeout(() => setBusy(false), 520)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => subscribeUserCreatedEvents(() => setCatalogVersion((v) => v + 1)), [])

  const allEvents = useMemo(() => {
    void catalogVersion
    return getMergedEvents()
  }, [catalogVersion])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sod = startOfDay(new Date())
    const eow = endOfWeek(new Date())

    return allEvents.filter((e) => {
      if (category !== 'All' && e.category !== category) return false
      const start = new Date(e.startsAt).getTime()
      if (datePreset === 'today') {
        if (start < sod || start >= sod + 86400000) return false
      }
      if (datePreset === 'week') {
        if (start < sod || start > eow) return false
      }
      if (!q) return true
      const hay = `${e.title} ${e.description} ${e.location} ${e.host.name} ${e.category}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query, category, datePreset, allEvents])

  return (
    <div className="space-y-8">
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
      />

      {busy ? (
        <div className="space-y-4">
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      ) : filtered.length ? (
        filtered.length > 3 ? (
          <div className="space-y-3">
            {filtered.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface/90 px-4 py-3 shadow-card"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-fg">{e.title}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {new Intl.DateTimeFormat('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    }).format(new Date(e.startsAt))}
                  </p>
                </div>
                <Link
                  to={`/events/${e.id}`}
                  aria-label={`View event ${e.title}`}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2/60 text-fg-soft transition hover:border-border-strong hover:text-fg"
                >
                  {'>'}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} reservedByUser={reservedSet.has(e.id)} />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title="No events match your filters"
          description="Try widening the date window, clearing search, or exploring another category. Coaches post new sessions mid-week."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('')
                setCategory('All')
                setDatePreset('any')
              }}
            >
              Reset filters
            </Button>
          }
          icon={<SparkIcon />}
        />
      )}
    </div>
  )
}

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v3M12 18v3M3 12h3M18 12h3M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M17.7 6.3l-2.1 2.1M8.4 15.6l-2.1 2.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
