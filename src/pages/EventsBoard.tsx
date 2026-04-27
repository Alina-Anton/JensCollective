import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { EventCategory } from "@/data/mockData";
import { getMergedEvents, reservations } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteUserCreatedEvent,
  subscribeUserCreatedEvents,
} from "@/lib/userCreatedEvents";
import { EventCard } from "@/components/events/EventCard";
import { FilterBar } from "@/components/events/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { EventCardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/hooks/useToast";
const reservedSet = new Set(
  reservations
    .filter((r) => r.status === "confirmed" || r.status === "waitlist")
    .map((r) => r.eventId),
);

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function endOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = (day + 6) % 7;
  x.setDate(x.getDate() - diff + 6);
  x.setHours(23, 59, 59, 999);
  return x.getTime();
}

export function EventsBoard() {
  const { user } = useAuth();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<EventCategory | "All">("All");
  const [mineOnly, setMineOnly] = useState(false);
  const [datePreset, setDatePreset] = useState<"any" | "week" | "today">("any");
  const [busy, setBusy] = useState(true);
  const [catalogVersion, setCatalogVersion] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setBusy(false), 520);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(
    () => subscribeUserCreatedEvents(() => setCatalogVersion((v) => v + 1)),
    [],
  );

  const allEvents = useMemo(() => {
    void catalogVersion;
    return getMergedEvents();
  }, [catalogVersion]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sod = startOfDay(new Date());
    const eow = endOfWeek(new Date());

    return allEvents.filter((e) => {
      if (mineOnly) {
        if (!e.id.startsWith("evt-local-")) return false;
        if (e.creatorUid && user?.uid) {
          if (e.creatorUid !== user.uid) return false;
        } else {
          const userName = user?.displayName?.trim().toLowerCase();
          if (!userName || e.host.name.trim().toLowerCase() !== userName)
            return false;
        }
      }
      if (category !== "All" && e.category !== category) return false;
      const start = new Date(e.startsAt).getTime();
      if (datePreset === "today") {
        if (start < sod || start >= sod + 86400000) return false;
      }
      if (datePreset === "week") {
        if (start < sod || start > eow) return false;
      }
      if (!q) return true;
      const hay =
        `${e.title} ${e.description} ${e.location} ${e.host.name} ${e.category}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, category, datePreset, mineOnly, allEvents, user]);

  function canManageEvent(event: (typeof allEvents)[number]) {
    if (!event.id.startsWith("evt-local-")) return false;
    if (event.creatorUid && user?.uid) return event.creatorUid === user.uid;
    const userName = user?.displayName?.trim().toLowerCase();
    return Boolean(
      userName && event.host.name.trim().toLowerCase() === userName,
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <FilterBar
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
          mineOnly={mineOnly}
          onMineOnlyChange={setMineOnly}
          datePreset={datePreset}
          onDatePresetChange={setDatePreset}
        />
        <Button to="/events/new" className="mt-[20px] w-full">
          Create event
        </Button>
      </div>

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
                  <div className="flex min-w-0 items-center gap-1">
                    <p className="truncate text-sm font-semibold text-fg">
                      {e.title}
                    </p>
                    {canManageEvent(e) ? (
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/events/${e.id}/edit`}
                          aria-label={`Edit event ${e.title}`}
                          title="Edit event"
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-fg-soft transition hover:bg-surface-2/60 hover:text-fg"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden
                          >
                            <path
                              d="M4 20h4l10-10-4-4L4 16v4z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M13 7l4 4"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>
                        <button
                          type="button"
                          aria-label={`Delete event ${e.title}`}
                          title="Delete event"
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-fg-soft transition hover:bg-surface-2/60 hover:text-danger"
                          onClick={() => {
                            deleteUserCreatedEvent(e.id);
                            toast.push({
                              variant: "success",
                              title: "Event deleted",
                              description: `${e.title} was removed.`,
                            });
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden
                          >
                            <path
                              d="M18 6L6 18M6 6l12 12"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {new Intl.DateTimeFormat("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(e.startsAt))}
                  </p>
                </div>
                <Link
                  to={`/events/${e.id}`}
                  aria-label={`View event ${e.title}`}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2/60 text-fg-soft transition hover:border-border-strong hover:text-fg"
                >
                  {">"}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                reservedByUser={reservedSet.has(e.id)}
                editable={canManageEvent(e)}
                onDelete={() => {
                  deleteUserCreatedEvent(e.id);
                  toast.push({
                    variant: "success",
                    title: "Event deleted",
                    description: `${e.title} was removed.`,
                  });
                }}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title=""
          description="No events match your filters. Try adjusting your filters or check back later."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setCategory("All");
                setMineOnly(false);
                setDatePreset("any");
              }}
            >
              Reset filters
            </Button>
          }
        />
      )}
    </div>
  );
}
