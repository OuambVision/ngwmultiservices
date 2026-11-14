import { getPayload } from 'payload'
import config from '@payload-config'

const descriptions: Record<string, { en: string; fr: string }> = {
  automobile: {
    fr: 'Nettoyage des voitures, camionnettes et VUS : intérieur, extérieur, sièges, tapis et tableau de bord. L’intervention se fait chez vous ou à notre emplacement, dans Ottawa et les environs.',
    en: 'Cleaning for cars, vans and SUVs: interior, exterior, seats, carpets and dashboard. The visit takes place at your location or ours, in Ottawa and the surrounding area.',
  },
  residentiel: {
    fr: 'Maisons, appartements et condos : grand ménage, entretien régulier, cuisines, salles de bain, tapis, moquettes et meubles.',
    en: 'Houses, apartments and condos: deep cleaning, regular upkeep, kitchens, bathrooms, rugs, carpeting and furniture.',
  },
  commercial: {
    fr: 'Commerces, institutions, bureaux, entrepôts et espaces communs, avec le soin des planchers et des vitres.',
    en: 'Shops, institutions, offices, warehouses and common areas, including floors and windows.',
  },
  specialise: {
    fr: 'Nettoyage après construction ou sinistre, désinfection et assainissement, ou une intervention préparée selon le lieu.',
    en: 'Post-construction or post-disaster cleaning, disinfection and sanitizing, or a visit prepared for the site.',
  },
}

const payload = await getPayload({ config })

try {
  const categories = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
    locale: 'fr',
    overrideAccess: true,
  })
  const missing = categories.docs.flatMap((doc) =>
    doc.slug && descriptions[doc.slug] ? [] : [doc.slug || doc.title],
  )
  if (missing.length > 0) {
    throw new Error(`Description absente pour : ${missing.join(', ')}.`)
  }

  for (const doc of categories.docs) {
    const copy = descriptions[doc.slug!]
    if (!copy) continue
    await payload.update({
      collection: 'categories',
      id: doc.id,
      locale: 'fr',
      overrideAccess: true,
      data: { description: copy.fr },
    })
    await payload.update({
      collection: 'categories',
      id: doc.id,
      locale: 'en',
      fallbackLocale: false,
      overrideAccess: true,
      data: { description: copy.en },
    })
  }

  console.log(`Descriptions enregistrées pour ${categories.docs.length} catégorie(s).`)
} finally {
  await payload.destroy()
}
