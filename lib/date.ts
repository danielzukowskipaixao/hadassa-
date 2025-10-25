export const SAO_PAULO_TZ = 'America/Sao_Paulo'

function formatKey(date: Date, tz: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value || ''
  const y = get('year')
  const m = get('month')
  const d = get('day')
  return `${y}-${m}-${d}`
}

export function todayKey(): string {
  return formatKey(new Date(), SAO_PAULO_TZ)
}

export function keyFor(date: Date) {
  return formatKey(date, SAO_PAULO_TZ)
}

export function isFutureDayKey(dayKey: string) {
  const nowKey = todayKey()
  return dayKey > nowKey
}

export function parseDayKey(dayKey: string): Date {
  // Interpret dayKey as midnight in Sao Paulo, approximate by constructing Date from parts
  const [y, m, d] = dayKey.split('-').map((s) => parseInt(s, 10))
  // Create a Date in UTC close to Sao Paulo midnight; precise TZ conversion not needed for comparisons
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, 3, 0, 0))
}
