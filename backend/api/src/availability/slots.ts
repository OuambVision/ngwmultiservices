import { APIError, type Payload } from 'payload'

import {
  BLOCKING_BOOKING_STATUSES,
  calendarDay,
  dayRange,
  eachDay,
  expandTimeRange,
  nextCalendarDay,
  nowMinutesInToronto,
  TIME,
  timeToMinutes,
  todayInToronto,
  weekdayName,
  type Weekday,
} from '../lib/calendar'

type AvailabilityDoc = {
  blockEnd?: string | null
  blockStart?: string | null
  date?: string | null
  dateEnd?: string | null
  day?: string | null
  endTime?: string | null
  slotMinutes?: number | null
  startTime?: string | null
  times?: Array<{ time?: string | null }> | null
  type?: string | null
  validFrom?: string | null
  validTo?: string | null
}

function sliceDay(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  const day = value.slice(0, 10)
  return calendarDay(day)
}

function slotsFromDoc(doc: AvailabilityDoc): string[] {
  if (doc.startTime && doc.endTime && TIME.test(doc.startTime) && TIME.test(doc.endTime)) {
    return expandTimeRange(doc.startTime, doc.endTime, doc.slotMinutes ?? 60)
  }
  const slots = new Set<string>()
  for (const row of doc.times ?? []) {
    const time = row.time?.trim() ?? ''
    if (TIME.test(time)) slots.add(time)
  }
  return [...slots]
}

function ruleCoversDay(doc: AvailabilityDoc, day: string): boolean {
  const from = sliceDay(doc.validFrom)
  const to = sliceDay(doc.validTo)
  if (from && day < from) return false
  if (to && day > to) return false
  return true
}

function closureCoversDay(doc: AvailabilityDoc, day: string): boolean {
  const start = sliceDay(doc.date)
  if (!start) return false
  const end = sliceDay(doc.dateEnd) || start
  return day >= start && day <= end
}

function applyBlock(slots: Set<string>, doc: AvailabilityDoc) {
  const start = doc.blockStart?.trim()
  const end = doc.blockEnd?.trim()
  if (!start || !end || !TIME.test(start) || !TIME.test(end)) {
    slots.clear()
    return
  }
  const startMin = timeToMinutes(start)
  const endMin = timeToMinutes(end)
  if (startMin == null || endMin == null) return
  for (const time of [...slots]) {
    const minutes = timeToMinutes(time)
    if (minutes != null && minutes >= startMin && minutes < endMin) slots.delete(time)
  }
}

export async function resolveBookingWindow(payload: Payload): Promise<{ end: string; start: string }> {
  const today = todayInToronto()
  const rules = await payload.find({
    collection: 'availability',
    depth: 0,
    limit: 200,
    overrideAccess: true,
    pagination: false,
    where: { type: { equals: 'jour' } },
  })

  let start = today
  let end = today
  let found = false
  for (const doc of rules.docs as AvailabilityDoc[]) {
    const from = sliceDay(doc.validFrom) || today
    const to = sliceDay(doc.validTo)
    if (!to) continue
    found = true
    if (from < start) start = from
    if (to > end) end = to
  }

  if (!found) {
    // Fallback: 90 days ahead if no validity set
    let cursor = today
    for (let i = 0; i < 90; i += 1) cursor = nextCalendarDay(cursor)
    return { start: today, end: cursor }
  }

  if (start < today) start = today
  if (end < start) end = start
  return { start, end }
}

async function loadAvailability(payload: Payload) {
  return payload.find({
    collection: 'availability',
    depth: 0,
    limit: 500,
    overrideAccess: true,
    pagination: false,
  })
}

function buildSlotsForDay(
  day: string,
  docs: AvailabilityDoc[],
  taken: Set<string>,
): { closed: boolean; slots: string[] } {
  const weekday = weekdayName(day) as Weekday | null
  const exceptions = docs.filter(
    (doc) => doc.type === 'exception' && sliceDay(doc.date) === day,
  )
  const closures = docs.filter((doc) => doc.type === 'fermeture' && closureCoversDay(doc, day))

  const fullClose = closures.some((doc) => !doc.blockStart || !doc.blockEnd)
  if (fullClose && exceptions.length === 0) {
    return { closed: true, slots: [] }
  }

  const slots = new Set<string>()

  if (exceptions.length > 0) {
    for (const doc of exceptions) {
      for (const time of slotsFromDoc(doc)) slots.add(time)
    }
  } else if (weekday) {
    for (const doc of docs) {
      if (doc.type !== 'jour' || doc.day !== weekday) continue
      if (!ruleCoversDay(doc, day)) continue
      for (const time of slotsFromDoc(doc)) slots.add(time)
    }
  }

  for (const doc of closures) {
    if (doc.blockStart && doc.blockEnd) applyBlock(slots, doc)
  }

  for (const time of taken) slots.delete(time)

  const today = todayInToronto()
  if (day < today) return { closed: false, slots: [] }
  if (day === today) {
    const now = nowMinutesInToronto()
    for (const time of slots) {
      const minutes = timeToMinutes(time)
      if (minutes != null && minutes <= now) slots.delete(time)
    }
  }

  return { closed: slots.size === 0 && (fullClose || exceptions.length === 0 && !weekday), slots: [...slots].sort() }
}

async function takenTimesForService(
  payload: Payload,
  service: string,
  from: string,
  to: string,
): Promise<Map<string, Set<string>>> {
  const taken = await payload.find({
    collection: 'bookings',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { service: { equals: service } },
        { status: { in: [...BLOCKING_BOOKING_STATUSES] } },
        { date: { greater_than_equal: `${from}T00:00:00.000Z` } },
        { date: { less_than: `${nextCalendarDay(to)}T00:00:00.000Z` } },
      ],
    },
  })

  const byDay = new Map<string, Set<string>>()
  for (const booking of taken.docs as Array<{ date?: string | null; time?: string | null }>) {
    if (typeof booking.date !== 'string' || !booking.time) continue
    const day = booking.date.slice(0, 10)
    const set = byDay.get(day) ?? new Set<string>()
    set.add(booking.time)
    byDay.set(day, set)
  }
  return byDay
}

export async function listBookableSlots(
  payload: Payload,
  input: { date: string; service: string },
) {
  const day = calendarDay(input.date)
  if (!day || input.date !== day) {
    throw new APIError('Date attendue au format AAAA-MM-JJ.', 400)
  }
  if (!input.service) {
    throw new APIError('Le service est requis.', 400)
  }

  const window = await resolveBookingWindow(payload)
  if (day < window.start || day > window.end) {
    return { closed: false, date: day, slots: [] as string[] }
  }

  const [all, takenByDay] = await Promise.all([
    loadAvailability(payload),
    takenTimesForService(payload, input.service, day, day),
  ])

  const result = buildSlotsForDay(
    day,
    all.docs as AvailabilityDoc[],
    takenByDay.get(day) ?? new Set(),
  )

  return { closed: result.closed, date: day, slots: result.slots }
}

export async function listOpenDates(
  payload: Payload,
  input: { from: string; service: string; to: string },
) {
  const from = calendarDay(input.from)
  const to = calendarDay(input.to)
  if (!from || !to || input.from !== from || input.to !== to || from > to) {
    throw new APIError('Période attendue au format AAAA-MM-JJ.', 400)
  }
  if (!input.service) throw new APIError('Le service est requis.', 400)
  const span = eachDay(from, to)
  if (span.length > 120) throw new APIError('La période dépasse quatre mois.', 400)

  const window = await resolveBookingWindow(payload)
  const [all, takenByDay] = await Promise.all([
    loadAvailability(payload),
    takenTimesForService(payload, input.service, from, to),
  ])

  const docs = all.docs as AvailabilityDoc[]
  const dates = span.filter((day) => {
    if (day < window.start || day > window.end) return false
    const result = buildSlotsForDay(day, docs, takenByDay.get(day) ?? new Set())
    return result.slots.length > 0
  })
  return { dates, window }
}
