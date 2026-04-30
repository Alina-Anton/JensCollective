import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { members } from '@/data/mockData'
import { useAuth } from '@/hooks/useAuth'
import { isDemoModeEnabled } from '@/lib/demoMode'
import { getMergedMemberDirectory, subscribeMemberDirectory } from '@/lib/memberDirectory'
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
  const [directoryVersion, setDirectoryVersion] = useState(0)
  const decodedRef = decodeURIComponent(memberName ?? '')

  useEffect(() => subscribeMemberDirectory(() => setDirectoryVersion((v) => v + 1)), [])

  const member = useMemo(() => {
    void directoryVersion
    const allDirectoryMembers = getMergedMemberDirectory()
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
    const merged = [...allDirectoryMembers, ...(demoMode ? members : []), ...currentUserMember]
    const matches = merged.filter((m) => {
      const row = m as { uid?: string; email?: string; name?: string }
      return row.uid === decodedRef || row.email === decodedRef || row.name === decodedRef
    })
    if (!matches.length) return undefined
    return (
      matches.find((m) => Boolean((m as { avatarUrl?: string }).avatarUrl)) ??
      matches[0]
    )
  }, [decodedRef, user, demoMode, directoryVersion])
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
      <div className="mb-[10px]">
        <Link to="/members" className="text-sm font-medium text-fg-soft transition hover:text-fg">
          ← Back to Members
        </Link>
      </div>

      <Card>
        <CardBody className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar initials={member.initials} src={member.avatarUrl} title={member.name} className="size-14 text-base" />
            <div>
              <p className="text-lg font-semibold text-fg">{member.name}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface/40 p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted">Name</p>
              <p className="mt-1 text-sm text-fg-soft">{member.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted">Training Focus</p>
              <p className="mt-1 text-sm text-fg-soft">
                {memberProfile?.trainingFocus || (demoMode ? buildTrainingFocus(member.name) : 'Not shared yet')}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted">Belt</p>
              <p className="mt-1 text-sm text-fg-soft">
                {memberProfile?.belt || (demoMode ? buildBelt(member.name) : 'Not shared yet')}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted">Hobby</p>
              <p className="mt-1 text-sm text-fg-soft">
                {memberProfile?.hobby || (demoMode ? buildHobby(member.name) : 'Not shared yet')}
              </p>
            </div>
            {memberProfile?.shareContactInfo ? (
              <>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted">Phone</p>
                  <p className="mt-1 text-sm text-fg-soft">{memberProfile.phone || 'Not shared yet'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted">Emergency Contact</p>
                  <p className="mt-1 text-sm text-fg-soft">
                    {memberProfile.emergencyContact || 'Not shared yet'}
                  </p>
                </div>
              </>
            ) : null}
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted">About Me</p>
              <p className="mt-1 text-sm leading-relaxed text-fg-soft">
                {memberProfile?.aboutMe ||
                  (demoMode
                    ? `${member.name} trains consistently and brings positive energy to the mats. Focused on improving technique, supporting teammates, and building confidence through regular training.`
                    : 'No about section shared yet.')}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

