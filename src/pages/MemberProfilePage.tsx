import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { members } from '@/data/mockData'
import { useAuth } from '@/hooks/useAuth'
import { isDemoModeEnabled } from '@/lib/demoMode'
import { getLocalAuthMemberDirectory } from '@/lib/localCredentialsAuth'
import { findMemberProfileByName, getMemberProfileByKeys } from '@/lib/memberProfileStorage'

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'M'
  )
}

function pickByName(name: string, items: string[]) {
  const base = Array.from(name).reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return items[base % items.length]
}

function buildTrainingFocus(name: string) {
  return pickByName(name, [
    'Guard retention',
    'Top control',
    'Escapes',
    'Leg locks',
    'Takedowns',
    'Pressure passing',
  ])
}

function buildBelt(name: string) {
  return pickByName(name, ['White belt', 'Blue belt', 'Purple belt', 'Brown belt', 'Black belt'])
}

function buildHobby(name: string) {
  return pickByName(name, [
    'Hiking',
    'Coffee roasting',
    'Photography',
    'Chess',
    'Cycling',
    'Cooking',
  ])
}

export function MemberProfilePage() {
  const { memberName } = useParams()
  const { user } = useAuth()
  const demoMode = isDemoModeEnabled()
  const decodedRef = decodeURIComponent(memberName ?? '')
  const member = useMemo(() => {
    const localMembers = getLocalAuthMemberDirectory()
    const currentUserMember =
      user && user.displayName
        ? [
            {
              uid: user.uid,
              name: user.displayName,
              initials: initialsFromName(user.displayName),
              avatarUrl: user.photoURL ?? '',
            },
          ]
        : []
    const merged = [...localMembers, ...(demoMode ? members : []), ...currentUserMember]
    return merged.find((m) => (m as { uid?: string }).uid === decodedRef || m.name === decodedRef)
  }, [decodedRef, user, demoMode])
  const memberProfile =
    getMemberProfileByKeys([
      decodedRef,
      (member as { uid?: string }).uid,
      (member as { email?: string }).email,
      member?.name,
    ]) ?? (member ? findMemberProfileByName(member.name) : findMemberProfileByName(decodedRef))

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

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface/40 p-4">
              <p className="text-xs font-semibold tracking-wide text-muted">Name</p>
              <p className="mt-2 text-sm text-fg-soft">{member.name}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface/40 p-4">
              <p className="text-xs font-semibold tracking-wide text-muted">Training Focus</p>
              <p className="mt-2 text-sm text-fg-soft">
                {memberProfile?.trainingFocus || (demoMode ? buildTrainingFocus(member.name) : 'Not shared yet')}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface/40 p-4">
              <p className="text-xs font-semibold tracking-wide text-muted">Belt</p>
              <p className="mt-2 text-sm text-fg-soft">
                {memberProfile?.belt || (demoMode ? buildBelt(member.name) : 'Not shared yet')}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface/40 p-4">
              <p className="text-xs font-semibold tracking-wide text-muted">Hobby</p>
              <p className="mt-2 text-sm text-fg-soft">
                {memberProfile?.hobby || (demoMode ? buildHobby(member.name) : 'Not shared yet')}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface/40 p-4">
            <p className="text-xs font-semibold tracking-wide text-muted">About Me</p>
            <p className="mt-2 text-sm leading-relaxed text-fg-soft">
              {memberProfile?.aboutMe ||
                (demoMode
                  ? `${member.name} trains consistently and brings positive energy to the mats. Focused on improving technique, supporting teammates, and building confidence through regular training.`
                  : 'No about section shared yet.')}
            </p>
          </div>
        </CardBody>
      </Card>

      <Button to="/members" variant="secondary" className="w-full rounded-2xl">
        Back to Members
      </Button>
    </div>
  )
}

