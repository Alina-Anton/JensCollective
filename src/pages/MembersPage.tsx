import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { members } from '@/data/mockData'

const MEMBERS_PER_PAGE = 10

export function MembersPage() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return members
    return members.filter((member) => member.name.toLowerCase().includes(q))
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [query])

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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name..."
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-fg outline-none transition placeholder:text-muted focus:border-accent/45 focus:ring-2 focus:ring-accent/20 sm:w-64"
            />
          </div>
        </CardHeader>
        <CardBody>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedMembers.map((member) => (
              <Link
                key={member.name}
                to={`/members/${encodeURIComponent(member.name)}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 px-3 py-2.5"
              >
                <Avatar initials={member.initials} src={member.avatarUrl} title={member.name} />
                <span className="text-sm font-semibold text-fg">{member.name}</span>
              </Link>
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

