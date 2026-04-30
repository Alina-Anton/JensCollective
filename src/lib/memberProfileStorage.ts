export type MemberProfile = {
  preferredName: string
  phone?: string
  emergencyContact?: string
  shareContactInfo?: boolean
  trainingFocus: string
  aboutMe: string
  belt: string
  hobby: string
}

type StoredProfiles = Record<string, MemberProfile>

const STORAGE_KEY = 'jenscollective_member_profiles_v1'

function readProfiles(): StoredProfiles {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as StoredProfiles
  } catch {
    return {}
  }
}

function writeProfiles(profiles: StoredProfiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

export function getMemberProfile(profileKey: string): MemberProfile | null {
  if (!profileKey) return null
  const profiles = readProfiles()
  return profiles[profileKey] ?? null
}

export function getMemberProfileByKeys(profileKeys: Array<string | null | undefined>): MemberProfile | null {
  const profiles = readProfiles()
  for (const key of profileKeys) {
    if (!key) continue
    const hit = profiles[key]
    if (hit) return hit
  }
  return null
}

export function saveMemberProfile(profileKey: string, profile: MemberProfile) {
  if (!profileKey) return
  const profiles = readProfiles()
  profiles[profileKey] = profile
  writeProfiles(profiles)
}

export function findMemberProfileByName(name: string): MemberProfile | null {
  const needle = name.trim().toLowerCase()
  if (!needle) return null
  const profiles = readProfiles()
  for (const profile of Object.values(profiles)) {
    if (profile.preferredName.trim().toLowerCase() === needle) return profile
  }
  return null
}

