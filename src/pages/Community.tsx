import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { communityPosts, members } from '@/data/mockData'
import { useToast } from '@/hooks/useToast'
import { formatRelative } from '@/lib/format'

export function Community() {
  const toast = useToast()
  const [draft, setDraft] = useState('')
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null)
  const [commentComposerPostId, setCommentComposerPostId] = useState<string | null>(null)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})

  function getPostMessages(post: (typeof communityPosts)[number]) {
    const commenterNames = members.map((m) => m.name).filter((name) => name !== post.author)
    const commentBodiesByPost: Record<string, string[]> = {
      p1: [
        'I am in. I can stay after class on Friday.',
        'Count me in for passing drills.',
        'I can do three rounds before heading out.',
        'Perfect timing, I wanted extra reps this week.',
      ],
      p2: [
        'I am down. What time are we meeting?',
        'Love this idea, I will join after class.',
        'I can make Sunday and bring an extra coffee.',
      ],
      p3: [
        'I would love one pair if still available.',
        'Thanks for donating, this helps a lot.',
        'Could you bring them on Wednesday evening?',
      ],
    }
    const commentBodies = commentBodiesByPost[post.id] ?? ['Thanks for sharing this.']
    return Array.from({ length: post.comments }, (_, i) => ({
      id: `${post.id}-msg-${i + 1}`,
      author: commenterNames[i % commenterNames.length] ?? 'Jordan Ellis',
      body: commentBodies[i % commentBodies.length],
    }))
  }

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm leading-relaxed text-muted">
        Stay connected with your gym community—share wins, ask for support, and post updates so we
        can keep each other motivated every week.
      </p>

      <div className="space-y-6">
        <Card>
          <CardBody className="space-y-3">
            <h2 className="font-display text-lg text-fg">Post an update</h2>
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
                <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar initials={p.initials} title={p.author} />
                    <p className="text-sm font-semibold text-fg">{p.author}</p>
                  </div>
                  <p className="shrink-0 text-[11px] font-semibold tracking-wide text-muted">
                    {formatRelative(p.at)}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-display text-xl tracking-tight text-fg">{p.title}</p>
                  <p className="text-sm leading-relaxed text-fg-soft">{p.body}</p>
                </div>

                <div className="pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => setCommentComposerPostId((id) => (id === p.id ? null : p.id))}
                  >
                    Add comment
                  </Button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 text-center">
                  <span className="text-xs text-muted">{p.comments} comments</span>
                  <button
                    type="button"
                    onClick={() => setOpenCommentsPostId((id) => (id === p.id ? null : p.id))}
                    aria-label="Show all messages in this post"
                    title={openCommentsPostId === p.id ? 'Hide messages' : 'Show all messages'}
                    className="inline-flex h-5 w-5 items-center justify-center text-fg-soft transition hover:text-fg"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                      className={openCommentsPostId === p.id ? 'rotate-180 transition-transform' : 'transition-transform'}
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

                {commentComposerPostId === p.id ? (
                  <div className="space-y-2 border-t border-border pt-3">
                    <textarea
                      rows={3}
                      value={commentDrafts[p.id] ?? ''}
                      onChange={(e) =>
                        setCommentDrafts((prev) => ({
                          ...prev,
                          [p.id]: e.target.value,
                        }))
                      }
                      placeholder="Write your comment..."
                      className="w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg outline-none ring-white/0 transition placeholder:text-muted focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
                    />
                    <div className="flex w-full gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 w-full px-3 text-xs"
                        onClick={() => {
                          setCommentComposerPostId(null)
                          setCommentDrafts((prev) => ({ ...prev, [p.id]: '' }))
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-8 w-full px-3 text-xs"
                        onClick={() => {
                          const value = (commentDrafts[p.id] ?? '').trim()
                          if (!value) return
                          toast.push({
                            variant: 'success',
                            title: 'Comment added',
                            description: 'Your comment was posted.',
                          })
                          setCommentComposerPostId(null)
                          setCommentDrafts((prev) => ({ ...prev, [p.id]: '' }))
                        }}
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                ) : null}

                {openCommentsPostId === p.id ? (
                  <div className="space-y-2 border-t border-border pt-3">
                    {getPostMessages(p).map((message) => (
                      <div key={message.id} className="rounded-xl border border-border bg-surface/40 px-3 py-2">
                        <p className="text-xs font-semibold text-fg">{message.author}</p>
                        <p className="mt-1 text-xs text-fg-soft">{message.body}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
