import { getPayload } from 'payload'
import config from '@payload-config'

import { WORK_WEEKDAYS } from '../lib/calendar'

const validFrom = '2026-11-01'
const validTo = '2027-03-31'

const payload = await getPayload({ config })

try {
  const existing = await payload.find({
    collection: 'availability',
    depth: 0,
    limit: 500,
    overrideAccess: true,
    pagination: false,
  })
  for (const doc of existing.docs) {
    await payload.delete({
      collection: 'availability',
      id: doc.id,
      overrideAccess: true,
    })
  }

  let created = 0
  for (const day of WORK_WEEKDAYS) {
    await payload.create({
      collection: 'availability',
      overrideAccess: true,
      data: {
        type: 'jour',
        day,
        startTime: '08:00',
        endTime: '17:00',
        slotMinutes: 60,
        validFrom,
        validTo,
      },
    })
    created += 1
  }

  // Sample closures: Christmas week + New Year day + a half-day block example
  const closures = [
    { date: '2026-12-24', dateEnd: '2026-12-26' },
    { date: '2027-01-01' },
    { date: '2026-12-31', blockStart: '12:00', blockEnd: '17:00' },
  ] as const

  for (const row of closures) {
    await payload.create({
      collection: 'availability',
      overrideAccess: true,
      data: {
        type: 'fermeture',
        ...row,
      },
    })
    created += 1
  }

  console.log(
    `Disponibilités rechargées : ${created} entrées. Lun–sam 08:00–17:00 (créneaux 60 min), valide du ${validFrom} au ${validTo}. Fermetures Noël / Jour de l’an + 31 déc. après-midi.`,
  )
} finally {
  await payload.destroy()
}
