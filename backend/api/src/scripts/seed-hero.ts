import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const heroDir = path.resolve(dirname, '../../../../apps/web/public/hero')

const heroFiles = [
  { filename: 'hero.png', alt: 'Voiture couverte de mousse dans un atelier de lavage' },
  { filename: 'hero-residentiel.png', alt: 'Lavage de revêtement devant une maison' },
  { filename: 'hero-commercial.png', alt: 'Lavage de vitrine d’un commerce' },
  { filename: 'hero-tapis-meuble.png', alt: 'Nettoyage d’un tapis dans un salon' },
  { filename: 'hero-demenagement.png', alt: 'Transport d’un canapé vers un camion' },
  { filename: 'hero-montage-installation.png', alt: 'Montage d’un meuble dans un salon' },
  { filename: 'hero-maintenance-legere.png', alt: 'Réparation d’une porte de cuisine' },
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

async function ensureMedia(payload: Payload, filename: string, alt: string) {
  const existing = await findByFilename(payload, filename)
  if (existing) return { doc: existing, created: false }

  const data = await readFile(path.join(heroDir, filename))
  const file = {
    name: filename,
    data,
    mimetype: 'image/png',
    size: data.length,
  }
  const doc = await payload.create({
    collection: 'media',
    overrideAccess: true,
    data: { alt },
    file,
  })
  return { doc, created: true }
}

const payload = await getPayload({ config })

try {
  const rows: { image: number }[] = []
  let created = 0

  for (const item of heroFiles) {
    const { doc, created: isNew } = await ensureMedia(payload, item.filename, item.alt)
    if (isNew) created += 1
    rows.push({ image: doc.id })
  }

  await payload.updateGlobal({
    slug: 'siteSettings',
    overrideAccess: true,
    data: { heroImages: rows },
  })

  const settings = await payload.findGlobal({
    slug: 'siteSettings',
    depth: 0,
    overrideAccess: true,
  })
  const urls = (settings.heroImages ?? []).flatMap((row) =>
    row.url?.startsWith('http') ? [new URL(row.url).host] : [],
  )

  console.log(
    `Bandeau : ${created} image(s) créée(s), ${heroFiles.length - created} réutilisée(s), ${urls.length} adresse(s) publique(s).`,
  )
} finally {
  await payload.destroy()
}
