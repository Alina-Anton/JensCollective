import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  approveMemberRequest,
  getMemberRequests,
  subscribeMemberRequests,
  type MemberRequest,
} from '@/lib/memberRequests'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { isAdminUser } from '@/lib/adminUsers'

export function NewMemberRequests() {
  const { user, loading } = useAuth()
  const toast = useToast()
  const [version, setVersion] = useState(0)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  useEffect(() => subscribeMemberRequests(() => setVersion((v) => v + 1)), [])

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <p className="text-sm text-muted">Loading requests...</p>
      </section>
    )
  }

  if (!isAdminUser(user)) {
    return <Navigate to="/" replace />
  }

  const requests = useMemo(
    () => getMemberRequests().filter((r) => r.status === 'pending'),
    [version],
  )

  function onApprove(request: MemberRequest) {
    setApprovingId(request.id)
    try {
      approveMemberRequest(request)
      toast.push({
        variant: 'success',
        title: 'Request approved',
        description: `${request.name} was added to Members.`,
      })
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <header>
        <h1 className="font-display text-2xl text-fg">New Member Requests</h1>
        <p className="mt-1 text-sm text-muted">
          Review join requests and approve members.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-fg">Requests</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {requests.length ? (
            requests.map((r) => (
              <article key={r.id} className="rounded-xl border border-border bg-surface-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-fg">{r.name}</p>
                  <span
                    className={
                      r.status === 'pending'
                        ? 'rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-warning'
                        : 'rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-success'
                    }
                  >
                    {r.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Referred by: {r.referredBy || 'N/A'}
                </p>
                {r.email ? <p className="mt-1 text-xs text-muted">Email: {r.email}</p> : null}
                <p className="mt-2 whitespace-pre-wrap text-sm text-fg-soft">{r.details}</p>
                {r.status === 'pending' ? (
                  <div className="mt-3">
                    <Button
                      onClick={() => onApprove(r)}
                      loading={approvingId === r.id}
                    >
                      Approve
                    </Button>
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <p className="text-sm text-muted">No requests yet.</p>
          )}
        </CardBody>
      </Card>

    </section>
  )
}

