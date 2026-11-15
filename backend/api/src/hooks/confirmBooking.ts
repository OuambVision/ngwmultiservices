import { ValidationError, type PayloadRequest } from 'payload'

import { BLOCKING_BOOKING_STATUSES, calendarDay, dayRange, TIME } from '../lib/calendar'
import { relationId } from '../lib/relation'

type BookingData = {
  date?: unknown
  service?: unknown
  status?: unknown
  time?: unknown
}

type ConfirmArgs = {
  data?: BookingData
  originalDoc?: BookingData & { id?: unknown }
  req: PayloadRequest
}

export async function rejectTakenSlot({ data, originalDoc, req }: ConfirmArgs) {
  if (!data) return data
  const status = data.status ?? originalDoc?.status
  const blocking = BLOCKING_BOOKING_STATUSES as readonly string[]
  if (typeof status !== 'string' || !blocking.includes(status)) return data

  const service = relationId(data.service) ?? relationId(originalDoc?.service)
  const day = calendarDay(data.date ?? originalDoc?.date)
  const timeValue = data.time ?? originalDoc?.time
  const time = typeof timeValue === 'string' ? timeValue.trim() : ''
  const currentId = relationId(originalDoc?.id)

  if (service == null || !day || !TIME.test(time)) {
    throw new ValidationError({
      collection: 'bookings',
      errors: [
        {
          message: 'Un créneau réservé exige un service, une date et une heure.',
          path: 'status',
        },
      ],
      req,
    })
  }

  const range = dayRange(day)
  const existing = await req.payload.find({
    collection: 'bookings',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { service: { equals: service } },
        { status: { in: [...BLOCKING_BOOKING_STATUSES] } },
        { time: { equals: time } },
        { date: { greater_than_equal: range.start } },
        { date: { less_than: range.end } },
        ...(currentId == null ? [] : [{ id: { not_equals: currentId } }]),
      ],
    },
  })

  if (existing.totalDocs > 0) {
    throw new ValidationError({
      collection: 'bookings',
      errors: [
        {
          message: 'Ce créneau est déjà pris pour ce service.',
          path: 'status',
        },
      ],
      req,
    })
  }

  data.time = time
  return data
}
