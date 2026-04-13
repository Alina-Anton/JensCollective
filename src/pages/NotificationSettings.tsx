import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { useToast } from '@/hooks/useToast'

export function NotificationSettings() {
  const toast = useToast()
  const [emailOn, setEmailOn] = useState(true)
  const [smsOn, setSmsOn] = useState(false)
  const [remindersOn, setRemindersOn] = useState(true)
  const [confirmOn, setConfirmOn] = useState(true)
  const [cancelOn, setCancelOn] = useState(true)

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Settings</p>
        <h1 className="font-display text-3xl tracking-tight text-fg sm:text-4xl">Notifications</h1>
        <p className="text-sm text-muted">
          Choose how GymBoard reaches you. We bias toward fewer, higher-signal messages—never
          marketing blasts.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg text-fg">Channels</h2>
            <p className="mt-1 text-xs text-muted">You can enable both—SMS is always optional.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                toast.push({
                  variant: 'success',
                  title: 'Test email sent',
                  description: 'Check your inbox for a GymBoard sample notification.',
                })
              }
            >
              Send test email
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                toast.push({
                  variant: 'error',
                  title: 'SMS not configured',
                  description: 'Mock state: add a phone number in profile to enable SMS previews.',
                })
              }
            >
              Send test SMS
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <Toggle
            label="Email notifications"
            description="Session changes, coach notes, and weekly digest (short)."
            checked={emailOn}
            onChange={(e) => setEmailOn(e.target.checked)}
          />
          <Toggle
            label="SMS notifications"
            description="High-priority alerts like waitlist promotions and same-day room swaps."
            checked={smsOn}
            onChange={(e) => setSmsOn(e.target.checked)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg text-fg">Reservations</h2>
          <p className="mt-1 text-xs text-muted">The moments members care about most.</p>
        </CardHeader>
        <CardBody className="space-y-3">
          <Toggle
            label="Reminders before class"
            description="Default: 24 hours and 1 hour. Quiet hours respected (10pm–7am)."
            checked={remindersOn}
            onChange={(e) => setRemindersOn(e.target.checked)}
          />
          <Toggle
            label="Reservation confirmations"
            description="Includes calendar attachment and location deep link."
            checked={confirmOn}
            onChange={(e) => setConfirmOn(e.target.checked)}
          />
          <Toggle
            label="Cancellations & room changes"
            description="If a coach cancels or moves a session, you will be notified immediately."
            checked={cancelOn}
            onChange={(e) => setCancelOn(e.target.checked)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-fg">Digest preview</p>
            <p className="mt-1 text-xs text-muted">
              A calm summary: who is coaching, what is filling up, and one community highlight.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              toast.push({
                variant: 'info',
                title: 'Preview queued',
                description: 'In production, we would render your personalized digest here.',
              })
            }
          >
            Preview weekly digest
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}
