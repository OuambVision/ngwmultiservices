import { APIError, type Payload } from 'payload'

import {
  bookingWindow,
  calendarDay,
  dayRange,
  eachDay,
  nextCalendarDay,
  nowMinutesInToronto,
  TIME,
  todayInToronto,
  weekdayName,
} from '../lib/calendar'

type OpenDay = {
  times?: Array<{ time?: string | null }> | null
}

type ConfirmedBooking = {
  time?: string | null
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

  const weekday = weekdayName(day)
  const range = dayRange(day)
  const closed = await payload.find({
    collection: 'availability',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { type: { equals: 'fermeture' } },
        { date: { greater_than_equal: range.start } },
        { date: { less_than: range.end } },
      ],
    },
  })

  if (closed.totalDocs > 0) {
    return { closed: true, date: day, slots: [] as string[] }
  }

  const open = await payload.find({
    collection: 'availability',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [{ type: { equals: 'jour' } }, { day: { equals: weekday } }],
    },
  })

  const slots = new Set<string>()
  for (const doc of open.docs as OpenDay[]) {
    for (const row of doc.times ?? []) {
      const time = row.time?.trim() ?? ''
      if (TIME.test(time)) slots.add(time)
    }
  }

  const taken = await payload.find({
    collection: 'bookings',
    depth: 0,
    limit: 200,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { service: { equals: input.service } },
        { status: { equals: 'confirmee' } },
        { date: { greater_than_equal: range.start } },
        { date: { less_than: range.end } },
      ],
    },
  })

  for (const booking of taken.docs as ConfirmedBooking[]) {
    if (booking.time) slots.delete(booking.time)
  }

  const today = todayInToronto()
  if (day < bookingWindow.start || day > bookingWindow.end || day < today) {
    return { closed: false, date: day, slots: [] as string[] }
  }
  if (day === today) {
    const now = nowMinutesInToronto()
    for (const time of slots) {
      const [hour, minute] = time.split(':').map(Number)
      if (hour * 60 + minute <= now) slots.delete(time)
    }
  }

  return { closed: false, date: day, slots: [...slots].sort() }
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
  if (span.length > 62) throw new APIError('La période dépasse deux mois.', 400)

  const [open, closed, taken] = await Promise.all([
    payload.find({
      collection: 'availability',
      depth: 0,
      limit: 20,
      overrideAccess: true,
      pagination: false,
      where: { type: { equals: 'jour' } },
    }),
    payload.find({
      collection: 'availability',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { type: { equals: 'fermeture' } },
          { date: { greater_than_equal: `${from}T00:00:00.000Z` } },
          { date: { less_than: `${nextCalendarDay(to)}T00:00:00.000Z` } },
        ],
      },
    }),
    payload.find({
      collection: 'bookings',
      depth: 0,
      limit: 500,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { service: { equals: input.service } },
          { status: { equals: 'confirmee' } },
          { date: { greater_than_equal: `${from}T00:00:00.000Z` } },
          { date: { less_than: `${nextCalendarDay(to)}T00:00:00.000Z` } },
        ],
      },
    }),
  ])

  const timesByDay = new Map<string, Set<string>>()
  for (const doc of open.docs as Array<OpenDay & { day?: string | null }>) {
    if (!doc.day) continue
    const times = timesByDay.get(doc.day) ?? new Set<string>()
    for (const row of doc.times ?? []) {
      const time = row.time?.trim() ?? ''
      if (TIME.test(time)) times.add(time)
    }
    timesByDay.set(doc.day, times)
  }

  const closedDays = new Set(
    (closed.docs as Array<{ date?: string | null }>)
      .map((doc) => (typeof doc.date === 'string' ? doc.date.slice(0, 10) : ''))
      .filter(Boolean),
  )
  const takenByDay = new Map<string, Set<string>>()
  for (const booking of taken.docs as Array<{ date?: string | null; time?: string | null }>) {
    if (typeof booking.date !== 'string' || !booking.time) continue
    const day = booking.date.slice(0, 10)
    const times = takenByDay.get(day) ?? new Set<string>()
    times.add(booking.time)
    takenByDay.set(day, times)
  }

  const today = todayInToronto()
  const now = nowMinutesInToronto()
  const dates = span.filter((day) => {
    if (day < bookingWindow.start || day > bookingWindow.end || day < today || closedDays.has(day)) return false
    const weekday = weekdayName(day)
    const times = new Set(weekday ? (timesByDay.get(weekday) ?? []) : [])
    for (const time of takenByDay.get(day) ?? []) times.delete(time)
    if (day === today) {
      for (const time of times) {
        const [hour, minute] = time.split(':').map(Number)
        if (hour * 60 + minute <= now) times.delete(time)
      }
    }
    return times.size > 0
  })
  return { dates }
}
