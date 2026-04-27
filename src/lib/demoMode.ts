const DEMO_MODE_KEY = 'jenscollective_demo_mode_v1'

export function isDemoModeEnabled(): boolean {
  try {
    return localStorage.getItem(DEMO_MODE_KEY) === '1'
  } catch {
    return false
  }
}

export function setDemoModeEnabled(enabled: boolean) {
  try {
    localStorage.setItem(DEMO_MODE_KEY, enabled ? '1' : '0')
  } catch {
    // ignore storage failures
  }
}

