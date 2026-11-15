/**
 * End-to-end scenarios against a running API (pnpm dev:api).
 * Usage: pnpm exec payload run src/scripts/test-availability-booking.ts
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import { listBookableSlots, listOpenDates, resolveBookingWindow } from '../availability/slots'

const payload = await getPayload({ config })

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

try {
  const services = await payload.find({
    collection: 'services',
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const service = services.docs[0]
  assert(service, 'Aucun service en BD')
  const serviceId = String(service.id)

  const window = await resolveBookingWindow(payload)
  console.log('WINDOW', window)
  assert(window.end >= '2027-03-01', 'La fenêtre doit atteindre mars 2027')

  // Find next open weekday with slots inside window
  const days = await listOpenDates(payload, {
    service: serviceId,
    from: window.start,
    to: window.start < '2026-12-01' ? '2026-12-15' : window.end.slice(0, 8) + '-15',
  })
  assert(days.dates.length > 0, 'Aucun jour ouvert trouvé')
  const openDay = days.dates.find((day) => day >= '2026-11-17') || days.dates[0]
  console.log('OPEN_DAY', openDay)

  const before = await listBookableSlots(payload, { service: serviceId, date: openDay })
  assert(before.slots.length > 0, `Pas de créneaux le ${openDay}`)
  const slot = before.slots[0]
  console.log('SLOT', slot, 'count', before.slots.length)

  // Christmas should be closed
  const xmas = await listBookableSlots(payload, { service: serviceId, date: '2026-12-25' })
  assert(xmas.slots.length === 0, 'Noël doit être fermé')
  console.log('XMAS_CLOSED ok')

  // Partial block on 2026-12-31 afternoon
  const nye = await listBookableSlots(payload, { service: serviceId, date: '2026-12-31' })
  assert(!nye.slots.includes('13:00'), '13:00 doit être bloqué le 31 déc.')
  assert(nye.slots.includes('08:00') || nye.slots.includes('09:00') || nye.slots.includes('10:00'), 'Matinée 31 déc. ouverte')
  console.log('NYE_PARTIAL ok', nye.slots)

  // Create pending booking → slot disappears
  const created = await payload.create({
    collection: 'bookings',
    overrideAccess: true,
    data: {
      service: service.id,
      date: openDay,
      time: slot,
      name: 'Test Disponibilité',
      email: 'test-disponibilite@example.com',
      phone: '613-000-0000',
      location: 'ngw',
      status: 'en_attente',
    },
  })
  console.log('BOOKING', created.id, created.reference)

  const after = await listBookableSlots(payload, { service: serviceId, date: openDay })
  assert(!after.slots.includes(slot), `Le créneau ${slot} doit disparaître après réservation`)
  console.log('HIDDEN_AFTER_BOOKING ok', after.slots.length)

  // Double booking same slot must fail
  let blocked = false
  try {
    await payload.create({
      collection: 'bookings',
      overrideAccess: true,
      data: {
        service: service.id,
        date: openDay,
        time: slot,
        name: 'Doublon',
        email: 'doublon@example.com',
        phone: '613-000-0001',
        location: 'ngw',
        status: 'en_attente',
      },
    })
  } catch {
    blocked = true
  }
  assert(blocked, 'Le double booking aurait dû être refusé')
  console.log('DOUBLE_BOOKING_BLOCKED ok')

  // Cleanup test booking
  await payload.delete({ collection: 'bookings', id: created.id, overrideAccess: true })
  const restored = await listBookableSlots(payload, { service: serviceId, date: openDay })
  assert(restored.slots.includes(slot), 'Le créneau doit réapparaître après annulation/suppression')
  console.log('RESTORED ok')

  console.log('ALL_SCENARIOS_PASSED')
} finally {
  await payload.destroy()
}
