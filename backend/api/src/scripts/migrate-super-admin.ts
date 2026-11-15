import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

try {
  const admins = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 200,
    overrideAccess: true,
    where: { role: { equals: 'admin' } },
  })

  let updated = 0
  for (const user of admins.docs) {
    await payload.update({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      data: { role: 'super-admin' },
    })
    updated += 1
    console.log(`OK ${user.email} → super-admin`)
  }

  console.log(`Migration terminée : ${updated} utilisateur(s) passé(s) en super-admin.`)
} finally {
  await payload.destroy()
}
