import { getPayload } from 'payload'
import config from '@payload-config'

import { bookingWindow } from '../lib/calendar'

const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'] as const
const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

const payload = await getPayload({ config })

try {
  let updated = 0
  let created = 0
  for (const day of days) {
    const existing = await payload.find({
      collection: 'availability',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ type: { equals: 'jour' } }, { day: { equals: day } }],
      },
    })
    const data = {
      type: 'jour' as const,
      day,
      times: times.map((time) => ({ time })),
    }
    const current = existing.docs[0]
    if (current) {
      await payload.update({
        collection: 'availability',
        id: current.id,
        overrideAccess: true,
        data,
      })
      updated += 1
    } else {
      await payload.create({
        collection: 'availability',
        overrideAccess: true,
        data,
      })
      created += 1
    }
  }
  console.log(
    `${created} jour(s) créé(s), ${updated} mis à jour. Lundi à samedi, ${times[0]} à ${times.at(-1)}. Le dimanche reste fermé. Fenêtre de réservation : ${bookingWindow.start} au ${bookingWindow.end}.`,
  )
} finally {
  await payload.destroy()
}
