import { getPayload } from 'payload'
import config from '@payload-config'

type Localized = { en: string; fr: string }

type ServiceFact = {
  category: string
  duration: Localized
  order: number
  place?: Localized
  priceFrom: number
  slug: string
  title: Localized
  zone?: Localized
}

const atYourLocation: Localized = {
  fr: 'Chez vous ou à notre emplacement',
  en: 'At your location or ours',
}
const ottawaArea: Localized = {
  fr: 'Ottawa et environs',
  en: 'Ottawa and the surrounding area',
}

const services: ServiceFact[] = [
  fact('automobile', 'lavage-exterieur', 'Lavage extérieur', 'Exterior wash', 1, 40, '1 à 2 heures', '1 to 2 hours', { place: atYourLocation, zone: ottawaArea }),
  fact('automobile', 'nettoyage-interieur', 'Nettoyage intérieur', 'Interior cleaning', 2, 60, '1 à 2 heures', '1 to 2 hours', { place: atYourLocation, zone: ottawaArea }),
  fact('automobile', 'sieges-et-tapis', 'Sièges et tapis', 'Seats and carpets', 3, 80, '1 à 2 heures', '1 to 2 hours', { place: atYourLocation, zone: ottawaArea }),
  fact('automobile', 'tableau-de-bord', 'Tableau de bord', 'Dashboard', 4, 30, '30 minutes', '30 minutes', { place: atYourLocation, zone: ottawaArea }),
  fact('automobile', 'detail-complet', 'Détail complet', 'Full detail', 5, 120, '3 à 5 heures', '3 to 5 hours', { place: atYourLocation, zone: ottawaArea }),
  fact('automobile', 'camionnettes-et-vus', 'Camionnettes et VUS', 'Trucks and SUVs', 6, 100, '2 à 4 heures', '2 to 4 hours', { place: atYourLocation, zone: ottawaArea }),
  fact('residentiel', 'maisons-appartements-condos', 'Maisons, appartements, condos', 'Houses, apartments and condos', 1, 150, '2 à 4 heures', '2 to 4 hours'),
  fact('residentiel', 'grand-menage-et-entretien-regulier', 'Grand ménage et entretien régulier', 'Deep cleaning and regular upkeep', 2, 180, '3 à 5 heures', '3 to 5 hours'),
  fact('residentiel', 'cuisines-et-salles-de-bain', 'Cuisines et salles de bain', 'Kitchens and bathrooms', 3, 90, '1 à 2 heures', '1 to 2 hours'),
  fact('residentiel', 'tapis-moquettes-et-meubles', 'Tapis, moquettes et meubles', 'Carpets, rugs and furniture', 4, 80, '1 à 2 heures', '1 to 2 hours'),
  fact('commercial', 'bureaux-et-salles-de-reunion', 'Bureaux et salles de réunion', 'Offices and meeting rooms', 1, 160, '2 à 4 heures', '2 to 4 hours'),
  fact('commercial', 'commerces-et-institutions', 'Commerces et institutions', 'Stores and institutions', 2, 180, '2 à 4 heures', '2 to 4 hours'),
  fact('commercial', 'entrepots-et-espaces-communs', 'Entrepôts et espaces communs', 'Warehouses and common areas', 3, 200, '3 à 5 heures', '3 to 5 hours'),
  fact('commercial', 'planchers-et-vitres', 'Planchers et vitres', 'Floors and windows', 4, 120, '1 à 2 heures', '1 to 2 hours'),
  fact('specialise', 'nettoyage-apres-construction', 'Nettoyage après construction', 'Post-construction cleaning', 1, 250, '4 à 8 heures', '4 to 8 hours'),
  fact('specialise', 'nettoyage-apres-sinistre', 'Nettoyage après sinistre', 'Post-disaster cleaning', 2, 300, '4 à 8 heures', '4 to 8 hours'),
  fact('specialise', 'desinfection-et-assainissement', 'Désinfection et assainissement', 'Disinfection and sanitizing', 3, 150, '1 à 2 heures', '1 to 2 hours'),
  fact('specialise', 'service-sur-mesure', 'Service sur mesure', 'Custom service', 4, 200, '2 à 4 heures', '2 to 4 hours'),
]

function fact(
  category: string,
  slug: string,
  titleFr: string,
  titleEn: string,
  order: number,
  priceFrom: number,
  durationFr: string,
  durationEn: string,
  location?: { place: Localized; zone: Localized },
): ServiceFact {
  return {
    category,
    duration: { en: durationEn, fr: durationFr },
    order,
    place: location?.place,
    priceFrom,
    slug,
    title: { en: titleEn, fr: titleFr },
    zone: location?.zone,
  }
}

const payload = await getPayload({ config })

try {
  const categories = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 20,
    overrideAccess: true,
    pagination: false,
  })
  const categoryId = new Map(
    categories.docs.flatMap((doc) => (doc.slug ? [[doc.slug, doc.id] as const] : [])),
  )

  const existing = await payload.find({
    collection: 'services',
    depth: 0,
    limit: 200,
    locale: 'fr',
    overrideAccess: true,
    pagination: false,
  })
  const bySlug = new Map(existing.docs.flatMap((doc) => (doc.slug ? [[doc.slug, doc] as const] : [])))
  const known = new Set(services.map((service) => service.slug))
  const extra = existing.docs.flatMap((doc) => (doc.slug && !known.has(doc.slug) ? [doc.slug] : []))
  if (extra.length > 0) {
    throw new Error(`Service hors catalogue : ${extra.join(', ')}.`)
  }

  let created = 0
  let updated = 0
  for (const service of services) {
    const category = categoryId.get(service.category)
    if (category == null) throw new Error(`Catégorie introuvable : ${service.category}.`)
    const current = bySlug.get(service.slug)
    const shared = {
      category,
      order: service.order,
      priceFrom: service.priceFrom,
      published: true,
    }
    if (current) {
      await payload.update({
        collection: 'services',
        id: current.id,
        locale: 'fr',
        overrideAccess: true,
        data: {
          ...shared,
          duration: service.duration.fr,
          ...(service.place ? { place: service.place.fr } : {}),
          ...(service.zone ? { zone: service.zone.fr } : {}),
        },
      })
      await payload.update({
        collection: 'services',
        id: current.id,
        locale: 'en',
        fallbackLocale: false,
        overrideAccess: true,
        data: {
          duration: service.duration.en,
          ...(service.place ? { place: service.place.en } : {}),
          ...(service.zone ? { zone: service.zone.en } : {}),
        },
      })
      updated += 1
    } else {
      const createdDoc = await payload.create({
        collection: 'services',
        locale: 'fr',
        overrideAccess: true,
        data: {
          ...shared,
          duration: service.duration.fr,
          slug: service.slug,
          title: service.title.fr,
        },
      })
      await payload.update({
        collection: 'services',
        id: createdDoc.id,
        locale: 'en',
        fallbackLocale: false,
        overrideAccess: true,
        data: { duration: service.duration.en, title: service.title.en },
      })
      created += 1
    }
  }

  console.log(`${updated} service(s) mis à jour, ${created} créé(s), tous publiés.`)
} finally {
  await payload.destroy()
}
