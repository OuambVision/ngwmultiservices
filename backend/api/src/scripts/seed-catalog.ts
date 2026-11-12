import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

import { importCatalogue } from '../seed/importCatalogue'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

async function findBySlug(payload: Payload, collection: 'categories' | 'services', slug: string) {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })
  return result.docs[0]
}

async function checkCatalog(payload: Payload) {
  const marker = `CATALOGUE-${Date.now()}`
  const automobile = await findBySlug(payload, 'categories', 'automobile')
  assert(automobile, 'Automobile est introuvable pour la vérification.')

  const first = await payload.create({
    collection: 'services',
    overrideAccess: true,
    data: {
      title: `${marker} premier`,
      category: automobile.id,
      priceFrom: 10,
      order: 1,
      published: true,
    },
  })
  const second = await payload.create({
    collection: 'services',
    overrideAccess: true,
    data: {
      title: `${marker} second`,
      category: automobile.id,
      priceFrom: 20,
      order: 2,
      published: true,
    },
  })

  try {
    const published = await payload.find({
      collection: 'services',
      depth: 0,
      overrideAccess: false,
      sort: 'order',
      where: { title: { contains: marker } },
    })
    assert(
      published.docs.map((doc) => doc.id).join() === [first.id, second.id].join(),
      'L’ordre d’affichage ne suit pas le champ ordre.',
    )

    await payload.update({
      collection: 'services',
      id: first.id,
      overrideAccess: true,
      data: { priceFrom: 55, published: false },
    })
    const hidden = await payload.find({
      collection: 'services',
      depth: 0,
      overrideAccess: false,
      where: { title: { contains: marker } },
    })
    assert(hidden.docs.length === 1 && hidden.docs[0]?.id === second.id, 'Le service masqué reste public.')
    const updated = await payload.findByID({
      collection: 'services',
      id: first.id,
      depth: 0,
      overrideAccess: true,
    })
    assert(updated.priceFrom === 55, 'Le prix indicatif n’a pas été enregistré.')

    await payload.update({
      collection: 'services',
      id: first.id,
      overrideAccess: true,
      data: { published: true },
    })
    const restored = await payload.find({
      collection: 'services',
      depth: 0,
      overrideAccess: false,
      where: { title: { contains: marker } },
    })
    assert(restored.docs.length === 2, 'Le service republié est absent de l’API.')

    const categorySlugs = ['automobile', 'residentiel', 'commercial', 'specialise']
    const categories = await payload.find({
      collection: 'categories',
      depth: 0,
      overrideAccess: false,
      sort: 'order',
      where: { slug: { in: categorySlugs } },
    })
    assert(
      categories.docs.map((doc) => doc.slug).join() === categorySlugs.join(),
      'Les catégories publiques ne suivent pas l’ordre prévu.',
    )
  } finally {
    await payload.delete({ collection: 'services', id: first.id, overrideAccess: true })
    await payload.delete({ collection: 'services', id: second.id, overrideAccess: true })
  }
}

const payload = await getPayload({ config })

try {
  const first = await importCatalogue(payload)
  const second = await importCatalogue(payload)
  assert(
    second.categoriesCreated === 0 && second.servicesCreated === 0,
    'Le second import a créé des doublons.',
  )
  await checkCatalog(payload)
  console.log(
    `Catalogue importé : ${first.categoriesCreated} catégorie(s) et ${first.servicesCreated} service(s) créés, ${first.servicesUpdated} service(s) mis à jour, ${first.skipped} ligne(s) vide(s) ignorée(s).`,
  )
} finally {
  await payload.destroy()
}
