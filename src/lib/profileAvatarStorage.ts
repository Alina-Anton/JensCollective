const STORAGE_KEY = 'jenscollective:profile-avatar'
const AVATAR_UPDATED = 'jenscollective:avatar-updated'

export function getProfileAvatarUrl(): string | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v && v.length > 0 ? v : null
  } catch {
    return null
  }
}

export function setProfileAvatarUrl(dataUrl: string | null) {
  try {
    if (dataUrl) localStorage.setItem(STORAGE_KEY, dataUrl)
    else localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event(AVATAR_UPDATED))
  } catch {
    // ignore quota / private mode
  }
}

export function subscribeProfileAvatar(listener: () => void) {
  window.addEventListener(AVATAR_UPDATED, listener)
  return () => window.removeEventListener(AVATAR_UPDATED, listener)
}
