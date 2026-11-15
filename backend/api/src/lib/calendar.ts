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

export const WORK_WEEKDAYS: Weekday[] = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
]

/** Bookings that still occupy a slot (hidden from public availability). */
export const BLOCKING_BOOKING_STATUSES = [
  'en_attente',
  'recue',
  'a_estimer',
  'devis_envoye',
  'acceptee',
  'confirmee',
  'en_cours',
  'litige',
] as const

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

export function timeToMinutes(time: string): number | null {
  if (!TIME.test(time)) return null
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

export function minutesToTime(total: number): string {
  const hour = Math.floor(total / 60)
  const minute = total % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/** Expand [start, end) into discrete slots. */
export function expandTimeRange(
  startTime: string,
  endTime: string,
  slotMinutes = 60,
): string[] {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  const step = Number(slotMinutes)
  if (start == null || end == null || !Number.isFinite(step) || step < 5 || start >= end) {
    return []
  }
  const slots: string[] = []
  for (let cursor = start; cursor + step <= end; cursor += step) {
    slots.push(minutesToTime(cursor))
  }
  // Also allow a final slot that starts before end even if shorter remainder was skipped:
  // Outlook-style: last start must be at least `step` before end, already handled.
  // If range is shorter than step but valid (e.g. 10:00-10:30 with 30 min), allow one slot:
  if (slots.length === 0 && end - start >= Math.min(step, 30)) {
    slots.push(minutesToTime(start))
  }
  return slots
}

export const weekdayOptions = WEEKDAYS.map((day) => ({
  label: day.charAt(0).toUpperCase() + day.slice(1),
  value: day,
}))
