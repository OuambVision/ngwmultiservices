import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const imageDir = path.resolve(dirname, '../../../../apps/web/public/3d/services')

const images = [
  {
    slug: 'automobile',
    filename: 'nettoyage-auto.png',
    alt: { fr: 'Nettoyage automobile professionnel', en: 'Professional automotive cleaning' },
  },
  {
    slug: 'residentiel',
    filename: 'nettoyage-residentiel.png',
    alt: { fr: 'Nettoyage résidentiel', en: 'Residential cleaning' },
  },
  {
    slug: 'commercial',
    filename: 'nettoyage-commercial.png',
    alt: { fr: 'Nettoyage commercial', en: 'Commercial cleaning' },
  },
  {
    slug: 'specialise',
    filename: 'nettoyage-specialise.png',
    alt: { fr: 'Nettoyage spécialisé', en: 'Specialized cleaning' },
  },
]

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

const payload = await getPayload({ config })

try {
  let created = 0
  for (const image of images) {
    const category = await payload.find({
      collection: 'categories',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: image.slug } },
    })
    const doc = category.docs[0]
    if (!doc) throw new Error(`Catégorie introuvable : ${image.slug}.`)

    let media = await findByFilename(payload, image.filename)
    if (!media) {
      const data = await readFile(path.join(imageDir, image.filename))
      media = await payload.create({
        collection: 'media',
        overrideAccess: true,
        locale: 'fr',
        data: { alt: image.alt.fr },
        file: {
          name: image.filename,
          data,
          mimetype: 'image/png',
          size: data.length,
        },
      })
      created += 1
    }

    await payload.update({
      collection: 'media',
      id: media.id,
      locale: 'fr',
      overrideAccess: true,
      data: { alt: image.alt.fr },
    })
    await payload.update({
      collection: 'media',
      id: media.id,
      locale: 'en',
      fallbackLocale: false,
      overrideAccess: true,
      data: { alt: image.alt.en },
    })
    await payload.update({
      collection: 'categories',
      id: doc.id,
      overrideAccess: true,
      data: { image: media.id },
    })
  }

  console.log(`Images de catégories enregistrées. ${created} fichier(s) créé(s).`)
} finally {
  await payload.destroy()
}
