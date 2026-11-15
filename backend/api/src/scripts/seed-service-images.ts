import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const imageDir = path.resolve(dirname, '../../../../apps/web/public/services img')

async function findByFilename(payload: Payload, filename: string) {
  const result = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { filename: { equals: filename } },
  })
  return result.docs[0]
}

function mediaId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value && typeof (value as { id: unknown }).id === 'number') {
    return (value as { id: number }).id
  }
  return null
}

const payload = await getPayload({ config })

try {
  const files = (await readdir(imageDir)).filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
  let created = 0
  let linked = 0
  let skipped = 0
  const missingServices: string[] = []

  for (const filename of files.sort((a, b) => a.localeCompare(b, 'fr'))) {
    const slug = filename.replace(/\.(png|jpe?g|webp)$/i, '')
    const services = await payload.find({
      collection: 'services',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
    const service = services.docs[0]
    if (!service) {
      missingServices.push(filename)
      skipped += 1
      continue
    }

    let media = await findByFilename(payload, filename)
    if (!media) {
      const data = await readFile(path.join(imageDir, filename))
      const mimetype = filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')
        ? 'image/jpeg'
        : filename.toLowerCase().endsWith('.webp')
          ? 'image/webp'
          : 'image/png'
      media = await payload.create({
        collection: 'media',
        overrideAccess: true,
        locale: 'fr',
        data: { alt: service.title },
        file: {
          name: filename,
          data,
          mimetype,
          size: data.length,
        },
      })
      created += 1
    } else {
      await payload.update({
        collection: 'media',
        id: media.id,
        locale: 'fr',
        overrideAccess: true,
        data: { alt: service.title },
      })
    }

    const current = mediaId(service.photo)
    if (current === media.id) {
      skipped += 1
      continue
    }

    await payload.update({
      collection: 'services',
      id: service.id,
      overrideAccess: true,
      data: { photo: media.id },
    })
    linked += 1
    console.log(`OK ${slug} ← ${filename}`)
  }

  console.log(
    `Photos services : ${linked} lié(s), ${created} média(x) créé(s), ${skipped} ignoré(s), ${files.length} fichier(s).`,
  )
  if (missingServices.length) {
    console.log(`Sans service correspondant : ${missingServices.join(', ')}`)
  }
} finally {
  await payload.destroy()
}
