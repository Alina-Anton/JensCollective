import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/Button";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import {
  currentUser,
  events,
  reservations,
} from "@/data/mockData";

const reservedSet = new Set(
  reservations
    .filter((r) => r.status === "confirmed" || r.status === "waitlist")
    .map((r) => r.eventId),
);

export function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 780);
    return () => window.clearTimeout(t);
  }, []);

  const upcoming = useMemo(() => {
    return [...events]
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      )
      .slice(0, 3);
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="min-w-0 space-y-2">
          <h1 className="font-display text-3xl tracking-tight text-fg sm:text-4xl">
            Good evening, {currentUser.name.split(" ")[0]}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            Your week is shaping up thoughtfully—two reservations confirmed, one
            waitlist, and a community note pinned for Saturday.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
          <Button to="/events/new" variant="primary" className="w-full sm:w-auto">
            Create event
          </Button>
          <Button to="/community" variant="secondary" className="w-full sm:w-auto">
            Post update
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard
          label="My bookings"
          value="4 sessions"
          hint="Across strength, conditioning, and mobility."
          actionTo="/me/reservations"
          actionLabel="Open my reserved events"
        />
        <StatsCard
          label="Community pulse"
          value="18 new updates"
          hint="Posts, announcements, and coach notes you have not read yet."
          actionTo="/community"
          actionLabel="Open community page"
        />
      </div>

      <div className="space-y-4">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl text-fg">Upcoming events</h2>
            <Link
              to="/events"
              className="shrink-0 text-sm font-semibold text-accent hover:text-[color-mix(in_oklab,var(--color-accent)_85%,white)]"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.map((e) => (
              <details
                key={e.id}
                className="group overflow-hidden rounded-2xl border border-border bg-surface/90 shadow-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-fg">{e.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                      <span>
                        {new Intl.DateTimeFormat("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(e.startsAt))}
                      </span>
                    </p>
                  </div>
                  <span className="shrink-0 text-accent transition group-open:rotate-180">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-border p-3">
                  <EventCard
                    event={e}
                    reservedByUser={reservedSet.has(e.id)}
                    hideTitle
                    className="border-0 bg-transparent shadow-none"
                  />
                </div>
              </details>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

