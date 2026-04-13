export function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.max(1, Math.round(diffMs / 60000))
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 48) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  return `${days}d ago`
}

export function formatDateTimeRange(startsAt: string, endsAt: string) {
  const s = new Date(startsAt)
  const e = new Date(endsAt)
  const day = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
  return {
    dayLine: day.format(s),
    timeLine: `${time.format(s)} – ${time.format(e)}`,
  }
}
