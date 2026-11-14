const WEEKDAYS = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
] as const

export type Weekday = (typeof WEEKDAYS)[number]

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/
export const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

export function calendarDay(value: unknown): string | null {
  if (typeof value === 'string' && DAY.test(value)) return value
  if (typeof value !== 'string' && !(value instanceof Date)) return null

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

export function nextCalendarDay(day: string): string {
  const match = DAY.exec(day)
  if (!match) return day
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + 1))
  return date.toISOString().slice(0, 10)
}

export function weekdayName(day: string): Weekday | null {
  const match = DAY.exec(day)
  if (!match) return null
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return WEEKDAYS[date.getUTCDay()] ?? null
}

export function dayRange(day: string) {
  return {
    start: `${day}T00:00:00.000Z`,
    end: `${nextCalendarDay(day)}T00:00:00.000Z`,
  }
}

export const bookingWindow = {
  start: '2026-11-01',
  end: '2026-12-31',
} as const

export function todayInToronto(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function nowMinutesInToronto(now = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Toronto',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0')
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0')
  return hour * 60 + minute
}

export function eachDay(start: string, end: string): string[] {
  const days: string[] = []
  let cursor = start
  while (cursor <= end) {
    days.push(cursor)
    const next = nextCalendarDay(cursor)
    if (next === cursor) break
    cursor = next
  }
  return days
}

export const weekdayOptions = WEEKDAYS.map((day) => ({
  label: day.charAt(0).toUpperCase() + day.slice(1),
  value: day,
}))
