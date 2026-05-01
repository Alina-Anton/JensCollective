import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReserveButton } from "@/components/events/ReserveButton";
import {
  getEventById,
  spotsLeft,
} from "@/data/mockData";
import { formatDateTimeRange } from "@/lib/format";
import { useToast } from "@/hooks/useToast";
import {
  cancelUserReservation,
  getReservationNamesByEventId,
  getReservedEventIdSet,
  subscribeUserReservations,
  upsertUserReservation,
} from "@/lib/userReservations";
import {
  appendEventComment,
  getEventCommentsByEventId,
  subscribeEventComments,
} from "@/lib/userEventComments";
import { useAuth } from "@/hooks/useAuth";
import { displayNameForUser } from "@/lib/userDisplay";

const COMMENTS_PER_PAGE = 5;

export function EventDetail() {
  const { eventId } = useParams();
  const toast = useToast();
  const { user } = useAuth();
  const [threadPage, setThreadPage] = useState(1);
  const [commentsVersion, setCommentsVersion] = useState(0);
  const [reservationsVersion, setReservationsVersion] = useState(0);
  const [showCommentComposer, setShowCommentComposer] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const event = eventId ? getEventById(eventId) : undefined;
  useEffect(
    () => subscribeEventComments(() => setCommentsVersion((v) => v + 1)),
    [],
  );
  useEffect(
    () => subscribeUserReservations(() => setReservationsVersion((v) => v + 1)),
    [],
  );
  void commentsVersion;
  void reservationsVersion;
  const discussionThread = event ? getEventCommentsByEventId(event.id) : [];
  const totalPages = Math.max(
    1,
    Math.ceil(discussionThread.length / COMMENTS_PER_PAGE),
  );
  const currentPage = Math.min(Math.max(1, threadPage), totalPages);
  const visibleThread = discussionThread.slice(
    (currentPage - 1) * COMMENTS_PER_PAGE,
    currentPage * COMMENTS_PER_PAGE,
  );

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
    );
  }

  const left = spotsLeft(event);
  const { dayLine, timeLine } = formatDateTimeRange(
    event.startsAt,
    event.endsAt,
  );
  const currentUid = user?.uid ?? "";
  const reservedByUser = Boolean(currentUid) && getReservedEventIdSet(currentUid).has(event.id);
  const reservedNames = getReservationNamesByEventId(event.id);
  const reservedPeople = reservedNames.map((name) => ({
    name,
    initials:
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "M",
  }));

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
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {event.description}
          </p>
        </div>

        <div className="grid gap-6 border-t border-border p-6 sm:grid-cols-3 sm:p-8">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted">
              Host
            </p>
            <div className="mt-2 flex items-center gap-3">
              <Avatar
                initials={event.host.initials}
                title={event.host.name}
                className="size-10"
              />
              <div>
                <p className="text-sm font-semibold text-fg">
                  {event.host.name}
                </p>
                <p className="text-xs text-muted">{event.host.title}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted">
              Date
            </p>
            <p className="mt-2 text-sm font-semibold text-fg">{dayLine}</p>
            <p className="mt-1 text-sm text-fg-soft">{timeLine}</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted">
              Location
            </p>
            <p className="mt-2 text-sm font-semibold text-fg">
              {event.location}
            </p>
            <p className="mt-1 text-sm text-muted">
              Arrive 10 minutes early to settle in.
            </p>
          </div>
        </div>

        <div className="space-y-5 border-t border-border p-6 sm:p-8">
          <div>
            <h2 className="font-display text-lg text-fg">About this session</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-fg-soft">
              <p>{event.longDescription}</p>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <h2 className="font-display text-lg text-fg">Who is going</h2>
            <div className="mt-3 space-y-3">
              {reservedNames.length ? (
                <ul className="space-y-2">
                  {reservedPeople.map((person) => (
                    <li
                      key={person.name}
                      className="flex items-center gap-2 text-sm text-fg-soft"
                    >
                      <Avatar
                        initials={person.initials}
                        title={person.name}
                        className="size-7"
                      />
                      <span>{person.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted">
                  No reservations yet for this event.
                </p>
              )}
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
              if (!currentUid) return;
              upsertUserReservation(
                event.id,
                mode === "waitlist" ? "waitlist" : "confirmed",
                { uid: currentUid, name: displayNameForUser(user) },
              );
              toast.push({
                variant: "success",
                title:
                  mode === "waitlist"
                    ? "You are on the waitlist"
                    : "Reservation confirmed",
                description: `${event.title} — calendar invite queued.`,
              });
            }}
            onCancel={() => {
              if (!user?.uid) return;
              cancelUserReservation(event.id, user.uid);
            }}
          />
          {left <= 0 && event.waitlistEnabled ? (
            <p className="text-xs text-muted">
              Waitlist members are promoted in order. You can leave the waitlist
              anytime from your reservations tab.
            </p>
          ) : null}
        </div>
      </section>

      <div className="space-y-8">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg text-fg">Discussion</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowCommentComposer((v) => !v)}
            >
              Add comment
            </Button>
            {showCommentComposer ? (
              <div className="space-y-2 rounded-2xl border border-border bg-surface/30 p-3">
                <textarea
                  rows={3}
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Write your comment..."
                  className="w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg outline-none ring-white/0 transition placeholder:text-muted focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
                />
                <div className="flex w-full gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setShowCommentComposer(false);
                      setCommentDraft("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      const body = commentDraft.trim();
                      if (!body || !user?.uid) return;
                      appendEventComment({
                        eventId: event.id,
                        author: displayNameForUser(user),
                        authorUid: user.uid,
                        body,
                      });
                      setShowCommentComposer(false);
                      setCommentDraft("");
                      setThreadPage(1);
                      toast.push({
                        variant: "success",
                        title: "Comment added",
                        description: `Your comment on ${event.title} was posted.`,
                      });
                    }}
                  >
                    Post
                  </Button>
                </div>
              </div>
            ) : null}
            {visibleThread.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border border-border bg-surface/40 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-fg">{m.author}</p>
                  <p className="text-[11px] font-semibold tracking-wide text-muted">
                    {new Date(m.at).toLocaleString()}
                  </p>
                </div>
                <p className="mt-2 text-sm text-fg-soft">{m.body}</p>
              </div>
            ))}
            {!discussionThread.length ? (
              <p className="text-sm text-muted">
                No comments yet for this event.
              </p>
            ) : null}
            {totalPages > 1 ? (
              <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-7 min-w-7 px-1"
                    disabled={currentPage === 1}
                    onClick={() => setThreadPage(Math.max(1, currentPage - 1))}
                    aria-label="Previous comments page"
                  >
                    {"<"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-7 min-w-7 px-1"
                    disabled={currentPage === totalPages}
                    onClick={() => setThreadPage(Math.min(totalPages, currentPage + 1))}
                    aria-label="Next comments page"
                  >
                    {">"}
                  </Button>
                </div>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg text-fg">
              Cancellation policy
            </h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-fg-soft">
            <p>
              Free cancellation until 12 hours before start. Late cancellations
              may be charged a no-show fee unless a waitlist member can take
              your spot.
            </p>
            <p className="text-muted">
              If you are waitlisted, you will be auto-promoted and notified by
              email and SMS if enabled.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
