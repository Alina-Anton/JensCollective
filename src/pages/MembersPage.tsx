import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { isAdminUser } from '@/lib/adminUsers'
import {
  deleteMemberDirectoryEntry,
  getMergedMemberDirectory,
  subscribeMemberDirectory,
} from '@/lib/memberDirectory'
import { deleteMemberProfileDoc } from '@/lib/memberProfileStorage'
import { useToast } from '@/hooks/useToast'

const MEMBERS_PER_PAGE = 10

export function MembersPage() {
  const { user } = useAuth()
  const toast = useToast()
  const isAdmin = isAdminUser(user)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [directoryVersion, setDirectoryVersion] = useState(0)

  useEffect(() => subscribeMemberDirectory(() => setDirectoryVersion((v) => v + 1)), [])

  const allMembers = useMemo(() => {
    void directoryVersion
    const allDirectoryMembers = getMergedMemberDirectory()
    const currentUserMember =
      user && user.displayName
        ? [
            {
              uid: user.uid,
              email: user.email ?? '',
              name: user.displayName,
              initials:
                user.displayName
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() ?? '')
                  .join('') || 'M',
              avatarUrl: user.photoURL ?? '',
            },
          ]
        : []
    const merged = [...allDirectoryMembers, ...currentUserMember]
    const byName = new Map<string, (typeof merged)[number]>()
    for (const member of merged) {
      const key = member.name.trim().toLowerCase()
      if (!key) continue
      if (!byName.has(key)) byName.set(key, member)
    }
    return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [user, directoryVersion])

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allMembers
    return allMembers.filter((member) => member.name.toLowerCase().includes(q))
  }, [query, allMembers])

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * MEMBERS_PER_PAGE,
    currentPage * MEMBERS_PER_PAGE,
  )

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm leading-relaxed text-muted">
        Browse the private member directory and connect with training partners.
      </p>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg text-fg">All members</h2>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search by name..."
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-fg outline-none transition placeholder:text-muted focus:border-accent/45 focus:ring-2 focus:ring-accent/20 sm:w-64"
            />
          </div>
        </CardHeader>
        <CardBody>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedMembers.map((member) => (
              <li
                key={member.uid ?? member.name}
                className="rounded-xl border border-border bg-surface/50 px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to={`/members/${encodeURIComponent(member.uid ?? member.name)}`}
                    className="min-w-0 flex flex-1 items-center gap-3"
                  >
                    <Avatar initials={member.initials} src={member.avatarUrl} title={member.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-fg">{member.name}</p>
                      <p className="truncate text-xs text-muted">{member.email || 'No email'}</p>
                    </div>
                  </Link>
                  {isAdmin && member.uid ? (
                    <button
                      type="button"
                      aria-label={`Delete member ${member.name}`}
                      title="Delete member"
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-fg-soft transition hover:bg-surface-2/60 hover:text-danger"
                      onClick={() => {
                        const approved = window.confirm('Are you sure you want to remove this member permanently?')
                        if (!approved) return
                        deleteMemberDirectoryEntry(member.uid)
                        deleteMemberProfileDoc(member.uid)
                        toast.push({
                          variant: 'success',
                          title: 'Member deleted',
                          description: `${member.name} was removed from the member directory.`,
                        })
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {!filteredMembers.length ? (
            <p className="mt-4 text-sm text-muted">No members found for “{query}”.</p>
          ) : null}

          {filteredMembers.length ? (
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted">
              <span>
                Showing {(currentPage - 1) * MEMBERS_PER_PAGE + 1}-
                {Math.min(currentPage * MEMBERS_PER_PAGE, filteredMembers.length)}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-7 min-w-7 px-1"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  {'<'}
                </Button>
                <span className="font-semibold text-fg-soft">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-7 min-w-7 px-1"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  {'>'}
                </Button>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  )
}

