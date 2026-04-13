import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

export function CreateEvent() {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <Button to="/events" variant="ghost" className="h-10 px-3">
          ← Back to board
        </Button>
        <Card className="overflow-hidden">
          <div className="relative">
            <div className="h-28 bg-gradient-to-br from-accent-soft via-secondary-soft to-page-bottom" />
            <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_20%_0%,rgba(142,69,133,0.26),transparent_55%)]" />
          </div>
          <CardBody className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">Published</Badge>
              <Badge tone="neutral">Members notified</Badge>
            </div>
            <h1 className="font-display text-3xl tracking-tight text-fg">Event is live</h1>
            <p className="text-sm leading-relaxed text-muted">
              Your session is now visible on the board with realistic placeholder scheduling. In
              production, GymBoard would queue emails, SMS reminders, and calendar holds.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button to="/events" variant="primary" className="sm:flex-1">
                View on board
              </Button>
              <Button to="/" variant="secondary" className="sm:flex-1">
                Return home
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button to="/events" variant="ghost" className="h-10 px-3">
          ← Cancel
        </Button>
        <p className="text-xs text-muted">Coach / admin posting flow (mock)</p>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        <h1 className="font-display text-3xl tracking-tight text-fg sm:text-4xl">Create event</h1>
        <p className="text-sm text-muted">
          Publish a session with clear expectations. Members decide faster when pricing, capacity,
          and coaching voice are upfront.
        </p>
      </div>

      <form
        className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault()
          window.setTimeout(() => setSubmitted(true), 450)
        }}
      >
        <Card className="lg:col-span-3">
          <CardHeader>
            <h2 className="font-display text-lg text-fg">Details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input label="Title" name="title" placeholder="Aurora Flow — breath-led mobility" required />
            <div>
              <label className="text-xs font-medium tracking-wide text-fg-soft" htmlFor="desc">
                Description
              </label>
              <textarea
                id="desc"
                name="description"
                required
                rows={5}
                placeholder="What should members expect? What should they bring?"
                className="mt-1.5 w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg outline-none ring-white/0 transition placeholder:text-muted focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Date" name="date" type="date" required />
              <Input label="Time" name="time" type="time" required />
            </div>

            <Input label="Location" name="location" placeholder="Studio B · Harbor Line" required />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Max spots" name="spots" type="number" min={1} placeholder="14" required />
              <Input label="Price (USD)" name="price" type="number" min={0} step={1} placeholder="28 (optional)" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="category" className="text-xs font-medium tracking-wide text-fg-soft">
                Category / type
              </label>
              <select
                id="category"
                name="category"
                className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-fg outline-none focus:border-accent/45 focus:ring-2 focus:ring-accent/20"
                defaultValue="Mobility"
              >
                <option>Strength</option>
                <option>Conditioning</option>
                <option>Mobility</option>
                <option>Workshop</option>
                <option>Social</option>
              </select>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-display text-lg text-fg">Presentation</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-6 text-center">
              <p className="text-sm font-semibold text-fg">Image upload</p>
              <p className="mt-2 text-xs text-muted">
                Drag a cover image here, or browse. Recommended 1600×900, under 2MB.
              </p>
              <Button type="button" variant="secondary" className="mt-4 w-full">
                Choose file
              </Button>
            </div>

            <div className="rounded-2xl border border-border bg-surface/40 p-4 text-xs text-muted">
              <p className="font-semibold text-fg-soft">Publishing checklist</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Clear title + outcome</li>
                <li>Realistic capacity</li>
                <li>Refund / cancellation language</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button type="submit" variant="primary" className="w-full">
                Publish event
              </Button>
              <Button type="button" variant="ghost" className="w-full">
                Save as draft
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  )
}
