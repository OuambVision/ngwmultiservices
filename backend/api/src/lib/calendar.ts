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

export const weekdayOptions = WEEKDAYS.map((day) => ({
  label: day.charAt(0).toUpperCase() + day.slice(1),
  value: day,
}))
