import { useParams } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { members } from '@/data/mockData'

function buildAboutMe(name: string) {
  return `${name} trains consistently and brings positive energy to the mats. Focused on improving technique, supporting teammates, and building confidence through regular training.`
}

export function MemberProfilePage() {
  const { memberName } = useParams()
  const decodedName = decodeURIComponent(memberName ?? '')
  const member = members.find((m) => m.name === decodedName)

  if (!member) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl tracking-tight text-fg sm:text-4xl">Member not found</h1>
        <p className="text-sm text-muted">
          This member may have been removed from the directory.
        </p>
        <Button to="/members" variant="secondary">
          Back to Members
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardBody className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar initials={member.initials} src={member.avatarUrl} title={member.name} className="size-14 text-base" />
            <div>
              <p className="text-lg font-semibold text-fg">{member.name}</p>
              <p className="text-sm text-muted">Gym member</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface/40 p-4">
            <p className="text-xs font-semibold tracking-wide text-muted">About Me</p>
            <p className="mt-2 text-sm leading-relaxed text-fg-soft">{buildAboutMe(member.name)}</p>
          </div>
        </CardBody>
      </Card>

      <Button to="/members" variant="secondary" className="w-full rounded-2xl">
        Back to Members
      </Button>
    </div>
  )
}

