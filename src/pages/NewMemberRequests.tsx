import { useEffect, useMemo, useState } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  approveMemberRequest,
  getMemberRequests,
  subscribeMemberRequests,
  type MemberRequest,
} from '@/lib/memberRequests'
import { useToast } from '@/hooks/useToast'

export function NewMemberRequests() {
  const toast = useToast()
  const [version, setVersion] = useState(0)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  useEffect(() => subscribeMemberRequests(() => setVersion((v) => v + 1)), [])

  const requests = useMemo(() => getMemberRequests(), [version])
  const pending = requests.filter((r) => r.status === 'pending')

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
          <h2 className="text-sm font-semibold text-fg">Pending requests</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {pending.length ? (
            pending.map((r) => (
              <article key={r.id} className="rounded-xl border border-border bg-surface-2 p-4">
                <p className="text-sm font-semibold text-fg">{r.name}</p>
                <p className="mt-1 text-xs text-muted">
                  Referred by: {r.referredBy || 'N/A'}
                </p>
                {r.email ? <p className="mt-1 text-xs text-muted">Email: {r.email}</p> : null}
                <p className="mt-2 whitespace-pre-wrap text-sm text-fg-soft">{r.details}</p>
                <div className="mt-3">
                  <Button
                    onClick={() => onApprove(r)}
                    loading={approvingId === r.id}
                  >
                    Approve
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-muted">No pending requests.</p>
          )}
        </CardBody>
      </Card>

    </section>
  )
}

