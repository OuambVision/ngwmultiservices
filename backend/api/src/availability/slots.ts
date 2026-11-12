import { APIError, type Payload } from 'payload'

import { calendarDay, dayRange, TIME, weekdayName } from '../lib/calendar'

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

  return { closed: false, date: day, slots: [...slots].sort() }
}
