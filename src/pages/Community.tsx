import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { activeMembers, communityPosts, events, trendingEventIds } from '@/data/mockData'
import { formatMoney, spotsLeft } from '@/data/mockData'
import { useToast } from '@/hooks/useToast'
import { formatRelative } from '@/lib/format'

export function Community() {
  const toast = useToast()
  const [draft, setDraft] = useState('')

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Community</p>
          <h1 className="font-display text-3xl tracking-tight text-fg sm:text-4xl">Board</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            Lightweight updates—no infinite scroll, no performative metrics. Just your gym, in
            writing.
          </p>
        </div>
        <Button to="/events" variant="secondary" className="sm:self-start">
          See events
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="font-display text-lg text-fg">Post an update</h2>
              <p className="mt-1 text-xs text-muted">Share wins, logistics, or thoughtful asks.</p>
            </CardHeader>
            <CardBody className="space-y-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                placeholder="What’s on your mind? Keep it kind, specific, and easy to act on."
                className="w-full resize-y rounded-2xl border border-border bg-surface px-3 py-2 text-sm text-fg outline-none ring-white/0 transition placeholder:text-muted focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted">Attachments and mentions ship in v2.</p>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    toast.push({
                      variant: 'success',
                      title: 'Update queued',
                      description: 'In production, this would publish to members instantly.',
                    })
                    setDraft('')
                  }}
                >
                  Publish update
                </Button>
              </div>
            </CardBody>
          </Card>

          <div className="space-y-4">
            {communityPosts.map((p) => (
              <Card key={p.id}>
                <CardBody className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <Avatar initials={p.initials} title={p.author} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-fg">{p.author}</p>
                          <Badge tone={p.role === 'Coach' ? 'accent' : p.role === 'Admin' ? 'warm' : 'neutral'}>
                            {p.role}
                          </Badge>
                          {p.pinned ? <Badge tone="success">Pinned</Badge> : null}
                        </div>
                        <p className="mt-2 font-display text-xl tracking-tight text-fg">{p.title}</p>
                        <p className="mt-2 text-sm leading-relaxed text-fg-soft">{p.body}</p>
                      </div>
                    </div>
                    <p className="shrink-0 text-[11px] font-semibold tracking-wide text-muted">
                      {formatRelative(p.at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1.5 text-xs font-semibold text-fg-soft transition hover:border-border-strong hover:text-fg"
                      onClick={() =>
                        toast.push({ variant: 'info', title: 'Thanks recorded', description: 'Mock reaction saved.' })
                      }
                    >
                      <HeartIcon />
                      Appreciate · {p.likes}
                    </button>
                    <span className="text-xs text-muted">{p.comments} comments (preview)</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="font-display text-lg text-fg">Trending events</h2>
              <p className="mt-1 text-xs text-muted">What members are circling this week.</p>
            </CardHeader>
            <CardBody className="space-y-3">
              {trendingEventIds.map((id) => {
                const e = events.find((x) => x.id === id)
                if (!e) return null
                const left = spotsLeft(e)
                return (
                  <Link
                    key={id}
                    to={`/events/${e.id}`}
                    className="block rounded-2xl border border-border bg-surface/40 p-4 transition hover:border-border-strong hover:bg-surface-2"
                  >
                    <p className="text-sm font-semibold text-fg">{e.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {left} spots left · {formatMoney(e.priceCents)}
                    </p>
                  </Link>
                )
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-lg text-fg">Active members</h2>
              <p className="mt-1 text-xs text-muted">A soft presence graph—privacy preserved.</p>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex -space-x-2">
                  {activeMembers.slice(0, 4).map((m) => (
                    <Avatar key={m.name} initials={m.initials} title={m.name} className="ring-2 ring-surface" />
                  ))}
                </div>
                <Badge tone="neutral">Now · 18</Badge>
              </div>
              <p className="text-xs text-muted">
                “Active” means engaged in the last 72 hours—attendance, posts, or reservations.
              </p>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-7-4.35-10-9c-1.8-3.1-.6-7 3-8 2.1-.6 4.3.3 5 2.2.7-1.9 2.9-2.8 5-2.2 3.6 1 4.8 5 3 8-3 4.65-10 9-10 9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
