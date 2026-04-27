import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { GymEvent } from '@/data/mockData'
import { formatMoney, spotsLeft, members } from '@/data/mockData'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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
  hideTitle = false,
  editable = false,
  onDelete,
}: {
  event: GymEvent
  className?: string
  reservedByUser?: boolean
  hideTitle?: boolean
  editable?: boolean
  onDelete?: () => void
}) {
  const left = spotsLeft(event)
  const toast = useToast()
  const [showAttendees, setShowAttendees] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showCommentComposer, setShowCommentComposer] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [postedComments, setPostedComments] = useState<string[]>([])

  const attendeeNames = members.slice(0, event.reservedCount).map((m) => m.name)
  const commentsCount = Math.max(1, Math.min(12, Math.round(event.reservedCount / 2)))
  const seedComments = attendeeNames.slice(0, commentsCount).map((name, i) => ({
    id: `${event.id}-comment-${i + 1}`,
    author: name,
    body: i % 2 === 0 ? 'I am in for this one.' : 'Looking forward to this session.',
  }))
  const allComments = [
    ...seedComments,
    ...postedComments.map((body, i) => ({
      id: `${event.id}-posted-${i + 1}`,
      author: 'Jordan Ellis',
      body,
    })),
  ]

  return (
    <Card className={cn('bg-surface overflow-hidden transition hover:border-border-strong', className)}>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            {!hideTitle ? (
              <div className="flex min-w-0 items-center gap-1">
                <Link
                  to={`/events/${event.id}`}
                  className="block min-w-0 truncate font-display text-lg leading-snug tracking-tight text-fg decoration-transparent underline-offset-4 transition hover:underline hover:decoration-accent/50"
                >
                  {event.title}
                </Link>
                {editable ? (
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/events/${event.id}/edit`}
                      aria-label={`Edit event ${event.title}`}
                      title="Edit event"
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-fg-soft transition hover:bg-surface-2/60 hover:text-fg"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
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
                      aria-label={`Delete event ${event.title}`}
                      title="Delete event"
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-fg-soft transition hover:bg-surface-2/60 hover:text-danger"
                      onClick={onDelete}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
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
            ) : null}
            <p className="text-sm text-muted">{event.description}</p>
          </div>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-4">
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
          <div>
            <dt className="text-xs font-semibold tracking-wide text-muted">Price</dt>
            <dd className="mt-1 text-fg-soft">{formatMoney(event.priceCents)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-muted">Spots</dt>
            <dd className="mt-1 text-fg-soft">
              {left}/{event.maxSpots}
            </dd>
          </div>
        </dl>

        <div className="w-full">
          <ReserveButton
            spotsLeft={left}
            waitlistEnabled={event.waitlistEnabled}
            defaultReserved={reservedByUser}
            className="w-full sm:w-full"
            onReserve={(mode) => {
              toast.push({
                variant: 'success',
                title: mode === 'waitlist' ? 'You are on the waitlist' : 'Reservation confirmed',
                description: `${event.title} — you will receive a calendar invite shortly.`,
              })
            }}
          />
        </div>

        <div className="space-y-2 text-center">
          <button
            type="button"
            onClick={() => setShowAttendees((v) => !v)}
            className="mx-auto inline-flex items-center gap-1 text-xs text-muted hover:text-fg-soft"
          >
            <span>See who is coming</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              className={showAttendees ? 'rotate-180 transition-transform' : 'transition-transform'}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {showAttendees ? (
            attendeeNames.length ? (
              <ul className="space-y-0.5 text-xs text-fg-soft">
                {attendeeNames.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted">No reservations yet.</p>
            )
          ) : null}
        </div>

        <div className="flex items-center justify-center gap-1 border-t border-border pt-3 text-center">
          <span className="text-xs text-muted">{allComments.length} comments</span>
          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            aria-label="Show all comments"
            className="inline-flex h-5 w-5 items-center justify-center text-fg-soft transition hover:text-fg"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              className={showComments ? 'rotate-180 transition-transform' : 'transition-transform'}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {showCommentComposer ? (
          <div className="space-y-2 border-t border-border pt-3">
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
                className="h-8 w-full px-3 text-xs"
                onClick={() => {
                  setShowCommentComposer(false)
                  setCommentDraft('')
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-8 w-full px-3 text-xs"
                onClick={() => {
                  if (!commentDraft.trim()) return
                  setPostedComments((prev) => [...prev, commentDraft.trim()])
                  setShowComments(true)
                  toast.push({
                    variant: 'success',
                    title: 'Comment added',
                    description: `Your comment on ${event.title} was posted.`,
                  })
                  setShowCommentComposer(false)
                  setCommentDraft('')
                }}
              >
                Post
              </Button>
            </div>
          </div>
        ) : null}

        {showComments ? (
          <div className="space-y-2 border-t border-border pt-3">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => setShowCommentComposer((v) => !v)}
            >
              Add comment
            </Button>
            {allComments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-border bg-surface/40 px-3 py-2">
                <p className="text-xs font-semibold text-fg">{comment.author}</p>
                <p className="mt-1 text-xs text-fg-soft">{comment.body}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  )
}
