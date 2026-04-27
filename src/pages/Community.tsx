import { useEffect, useMemo, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { formatRelative } from '@/lib/format'
import {
  appendUserCommunityComment,
  appendUserCommunityPost,
  deleteUserCommunityPost,
  deleteUserCommunityPostsByAuthor,
  getCommunityCommentsByPostId,
  getMergedCommunityPosts,
  subscribeUserCommunityPosts,
  updateUserCommunityPost,
} from '@/lib/userCommunityPosts'

export function Community() {
  const { user } = useAuth()
  const toast = useToast()
  const [draft, setDraft] = useState('')
  const [postsVersion, setPostsVersion] = useState(0)
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null)
  const [commentComposerPostId, setCommentComposerPostId] = useState<string | null>(null)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editDrafts, setEditDrafts] = useState<Record<string, string>>({})
  const posts = useMemo(() => {
    void postsVersion
    return getMergedCommunityPosts()
  }, [postsVersion])

  useEffect(() => subscribeUserCommunityPosts(() => setPostsVersion((v) => v + 1)), [])
  useEffect(() => {
    deleteUserCommunityPostsByAuthor('alinanton13')
  }, [])

  function getPostMessages(postId: string) {
    return getCommunityCommentsByPostId(postId)
  }

  function canManagePost(post: (typeof posts)[number]) {
    if (post.authorUid && user?.uid) return post.authorUid === user.uid
    const userName = user?.displayName?.trim().toLowerCase()
    return Boolean(userName && post.author.trim().toLowerCase() === userName)
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
                  const value = draft.trim()
                  if (!value) return
                  const name = user?.displayName?.trim() || user?.email?.split('@')[0] || 'Member'
                  const initials = name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase() ?? '')
                    .join('')
                  appendUserCommunityPost({
                    id: `post-${crypto.randomUUID()}`,
                    authorUid: user?.uid,
                    author: name,
                    initials: initials || 'M',
                    role: 'Member',
                    title: value.length > 64 ? `${value.slice(0, 64).trim()}...` : value,
                    body: value,
                    at: new Date().toISOString(),
                    likes: 0,
                    comments: 0,
                  })
                  toast.push({
                    variant: 'success',
                    title: 'Update published',
                    description: 'Your update is now visible in community.',
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
          {posts.length === 0 ? (
            <EmptyState
              title="No community updates yet"
              description="When members post updates, they will appear here."
            />
          ) : null}
          {posts.map((p) => (
            <Card key={p.id}>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar initials={p.initials} title={p.author} />
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm font-semibold text-fg">{p.author}</p>
                      {canManagePost(p) && editingPostId !== p.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label="Edit post"
                            title="Edit post"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-fg-soft transition hover:bg-surface-2/60 hover:text-fg"
                            onClick={() => {
                              setEditingPostId(p.id)
                              setEditDrafts((prev) => ({ ...prev, [p.id]: p.body }))
                            }}
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
                          </button>
                          <button
                            type="button"
                            aria-label="Delete post"
                            title="Delete post"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-fg-soft transition hover:bg-surface-2/60 hover:text-danger"
                            onClick={() => {
                              deleteUserCommunityPost(p.id)
                              if (openCommentsPostId === p.id) setOpenCommentsPostId(null)
                              if (commentComposerPostId === p.id) setCommentComposerPostId(null)
                              if (editingPostId === p.id) setEditingPostId(null)
                              toast.push({
                                variant: 'success',
                                title: 'Post deleted',
                                description: 'Your update was removed.',
                              })
                            }}
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
                  </div>
                  <p className="shrink-0 text-[11px] font-semibold tracking-wide text-muted">
                    {formatRelative(p.at)}
                  </p>
                </div>

                <div className="space-y-2">
                  {editingPostId === p.id ? (
                    <textarea
                      rows={4}
                      value={editDrafts[p.id] ?? p.body}
                      onChange={(e) =>
                        setEditDrafts((prev) => ({
                          ...prev,
                          [p.id]: e.target.value,
                        }))
                      }
                      className="w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg outline-none ring-white/0 transition placeholder:text-muted focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
                    />
                  ) : (
                    <p className="text-sm leading-relaxed text-fg-soft">{p.body}</p>
                  )}
                </div>

                {canManagePost(p) && editingPostId === p.id ? (
                  <div className="flex w-full gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 w-full px-3 text-xs"
                      onClick={() => {
                        setEditingPostId(null)
                        setEditDrafts((prev) => ({ ...prev, [p.id]: p.body }))
                      }}
                    >
                      Cancel edit
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-8 w-full px-3 text-xs"
                      onClick={() => {
                        const value = (editDrafts[p.id] ?? p.body).trim()
                        if (!value) return
                        updateUserCommunityPost(p.id, value)
                        setEditingPostId(null)
                        toast.push({
                          variant: 'success',
                          title: 'Post updated',
                          description: 'Your update was edited successfully.',
                        })
                      }}
                    >
                      Save edit
                    </Button>
                  </div>
                ) : null}

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
                  <span className="text-xs text-muted">
                    {getPostMessages(p.id).length} comments
                  </span>
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
                          const name =
                            user?.displayName?.trim() || user?.email?.split('@')[0] || 'Member'
                          appendUserCommunityComment({
                            id: `comment-${crypto.randomUUID()}`,
                            postId: p.id,
                            author: name,
                            body: value,
                            at: new Date().toISOString(),
                          })
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
                    {getPostMessages(p.id).map((message) => (
                      <div key={message.id} className="rounded-xl border border-border bg-surface/40 px-3 py-2">
                        <p className="text-xs font-semibold text-fg">{message.author}</p>
                        <p className="mt-1 text-xs text-fg-soft">{message.body}</p>
                      </div>
                    ))}
                    {getPostMessages(p.id).length === 0 ? (
                      <p className="text-xs text-muted">No comments yet.</p>
                    ) : null}
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
