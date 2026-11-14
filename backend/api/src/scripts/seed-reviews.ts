import { getPayload } from 'payload'
import config from '@payload-config'

type Copy = { en: string; fr: string }

type Item = {
  author: string
  category: string
  rating: number
  text: Copy
}

const items: Item[] = [
  review('automobile', 'Jean D.', 5, 'Excellent service. Ma voiture est ressortie comme neuve. L’équipe a été ponctuelle, professionnelle et très minutieuse. Je recommande vivement.', 'Excellent service. My car came out looking new. The team was punctual, professional and very thorough. I strongly recommend them.'),
  review('automobile', 'Sophie C.', 5, 'Lavage extérieur et intérieur impeccable. L’équipe a pris le temps de bien nettoyer tous les détails. Service rapide et courtois.', 'Spotless exterior and interior wash. The team took the time to clean every detail. Fast and courteous service.'),
  review('automobile', 'Luc M.', 4, 'L’habitacle a été bien aspiré et les sièges sont propres. Il restait une légère trace sur un tapis, mais le résultat global est très bon.', 'The cabin was well vacuumed and the seats are clean. A light mark remained on one mat, but the overall result is very good.'),
  review('automobile', 'Nadia B.', 5, 'Le détail complet valait le déplacement. Jantes, vitres et tableau de bord ont été repris sans traces. Je reviendrai.', 'The full detail was worth the trip. Wheels, glass and dashboard were finished without streaks. I will be back.'),
  review('automobile', 'Karim E.', 5, 'Notre VUS avait besoin d’un vrai nettoyage. Carrosserie et coffre sont impeccables. Communication claire du début à la fin.', 'Our SUV needed a real clean. The body and cargo area are spotless. Clear communication from start to finish.'),
  review('automobile', 'Chloé P.', 4, 'Bon lavage et séchage soigné. Les jantes sont propres. J’aurais aimé un peu plus de brillance, mais je suis satisfaite.', 'A good wash and careful drying. The wheels are clean. I would have liked a little more shine, but I am satisfied.'),
  review('residentiel', 'Marie L.', 5, 'Nettoyage complet de notre maison avant l’emménagement. Travail impeccable, équipe très professionnelle et à l’écoute. Résultat au-delà de nos attentes.', 'Full clean of our house before we moved in. Spotless work, a very professional and attentive team. The result was beyond our expectations.'),
  review('residentiel', 'Amina T.', 5, 'Très satisfaite du nettoyage de notre condo. Travail soigné, équipe sympathique et professionnelle. Je referai appel à vous sans hésitation.', 'Very happy with the cleaning of our condo. Careful work, a friendly and professional team. I will call you again without hesitation.'),
  review('residentiel', 'Hugo R.', 5, 'La cuisine et la salle de bain ont été désinfectées à fond. Les joints et le miroir sont nets. On a retrouvé un logement prêt à vivre.', 'The kitchen and bathroom were thoroughly disinfected. The joints and mirror are clean. The home was ready to live in again.'),
  review('residentiel', 'Sarah G.', 4, 'L’entretien régulier tient bien l’appartement. Les sols et les surfaces sont propres. Un passage un peu plus long sur les plinthes serait parfait.', 'The regular visit keeps the apartment in good shape. Floors and surfaces are clean. A little more time on the baseboards would make it perfect.'),
  review('residentiel', 'Yan K.', 5, 'Grand ménage après une location. Placards, électros et sols ont été repris. Les nouveaux occupants sont arrivés dans un logement nickel.', 'Deep clean after a rental. Cupboards, appliances and floors were all done. The new occupants arrived to a spotless home.'),
  review('residentiel', 'Inès F.', 5, 'Les tapis et le canapé ont été extraits avec soin. Les taches ont disparu et les tissus ont séché sans odeur. Très bon travail.', 'The rugs and sofa were extracted with care. The stains are gone and the fabrics dried without a smell. Very good work.'),
  review('commercial', 'Patrick K.', 5, 'Nous faisons appel à NGW pour l’entretien de nos bureaux depuis plusieurs mois. Service fiable, flexible et de grande qualité. Très satisfait.', 'We have called on NGW for our office upkeep for several months. Reliable, flexible and high-quality service. Very satisfied.'),
  review('commercial', 'Julie N.', 5, 'Les vitrines sont lavées des deux côtés et les cadres sont nets. Le commerce est présentable dès l’ouverture. Équipe discrète.', 'The storefronts are washed on both sides and the frames are clean. The shop looks ready at opening. A discreet team.'),
  review('commercial', 'Marc A.', 4, 'La salle de réunion est propre avant nos rencontres. Tables et vitres sont essuyées. Le sol pourrait être repris un peu plus souvent.', 'The meeting room is clean before our meetings. Tables and glass are wiped. The floor could be done a little more often.'),
  review('commercial', 'Sonia T.', 5, 'Les espaces communs de l’immeuble sont tenus. Hall, corridors et ascenseur sont propres. Les résidents l’ont remarqué.', 'The building’s common areas are maintained. Lobby, corridors and elevator are clean. Residents have noticed.'),
  review('commercial', 'Éric V.', 5, 'Décapage des planchers réussi. La finition est uniforme, y compris dans les coins. Le local a retrouvé un sol net.', 'The floor stripping went well. The finish is even, including in the corners. The premises have a clean floor again.'),
  review('commercial', 'Lina C.', 4, 'Entrepôt balayé et allées dégagées. Le passage a été efficace. Quelques coins restent poussiéreux, le reste est très bien.', 'The warehouse was swept and the aisles cleared. The visit was efficient. A few corners are still dusty, and the rest is very good.'),
  review('specialise', 'David R.', 5, 'Nettoyage après rénovation. L’équipe a fait un travail exceptionnel. Tout était propre et bien organisé. Merci.', 'Post-renovation cleaning. The team did an exceptional job. Everything was clean and well organized. Thank you.'),
  review('specialise', 'Nora S.', 5, 'Après le chantier, la poussière fine a été retirée des plinthes, des cadres et des vitres. La remise des clés s’est faite dans un logement propre.', 'After the job site, fine dust was removed from the baseboards, frames and glass. The keys were handed over in a clean home.'),
  review('specialise', 'Alain B.', 4, 'Intervention après un dégât dans une pièce. Les débris ont été retirés et le sol lavé. Un second passage sur un mur serait utile.', 'Visit after damage in one room. The debris was removed and the floor washed. A second pass on one wall would help.'),
  review('specialise', 'Fatou D.', 5, 'Désinfection des surfaces de contact dans nos locaux. Poignées, tables et sanitaires ont été traités. Équipe sérieuse et claire.', 'Disinfection of contact surfaces in our premises. Handles, tables and washrooms were treated. A serious and clear team.'),
  review('specialise', 'Olivier M.', 5, 'Le dégagement de poussière après les travaux a changé la pièce. Grilles, plinthes et sols sont nets. Travail minutieux.', 'The dust removal after the work changed the room. Vents, baseboards and floors are clean. Thorough work.'),
  review('specialise', 'Camille J.', 5, 'Besoin hors catalogue, bien cadré dès le départ. Les zones convenues ont été traitées et vérifiées avant le départ. Je referai appel.', 'A need outside the catalogue, scoped clearly from the start. The agreed areas were treated and checked before the team left. I will call again.'),
]

function review(category: string, author: string, rating: number, fr: string, en: string): Item {
  return { author, category, rating, text: { en, fr } }
}

function mediaId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'number') return value.id
  return null
}

const payload = await getPayload({ config })

try {
  const categories = await payload.find({
    collection: 'categories',
    depth: 1,
    limit: 20,
    locale: 'fr',
    overrideAccess: true,
    pagination: false,
  })
  const pools = new Map<string, number[]>()
  for (const category of categories.docs) {
    if (!category.slug) continue
    const image = mediaId(category.image)
    pools.set(category.slug, image ? [image] : [])
  }

  const services = await payload.find({
    collection: 'services',
    depth: 1,
    limit: 100,
    locale: 'fr',
    overrideAccess: true,
    pagination: false,
  })
  const serviceIds = new Map<string, number[]>()
  for (const service of services.docs) {
    if (service.published === false) continue
    const category = service.category
    const slug = category && typeof category === 'object' ? category.slug : null
    if (!slug) continue
    const ids = serviceIds.get(slug) ?? []
    ids.push(service.id)
    serviceIds.set(slug, ids)
    const pool = pools.get(slug) ?? []
    const photo = mediaId(service.photo)
    if (photo) pool.push(photo)
    for (const extra of service.photos ?? []) {
      const id = mediaId(extra)
      if (id) pool.push(id)
    }
    pools.set(slug, [...new Set(pool)])
  }

  const existing = await payload.find({
    collection: 'reviews',
    depth: 0,
    limit: 200,
    overrideAccess: true,
    pagination: false,
  })
  const byAuthor = new Map(existing.docs.flatMap((doc) => (doc.author ? [[doc.author, doc] as const] : [])))
  const seen = new Map<string, number>()
  let created = 0
  let updated = 0

  for (const entry of items) {
    const choices = serviceIds.get(entry.category) ?? []
    if (choices.length === 0) throw new Error(`Aucun service publié pour ${entry.category}.`)
    const index = seen.get(entry.category) ?? 0
    seen.set(entry.category, index + 1)
    const pool = pools.get(entry.category) ?? []
    const count = Math.min(3, pool.length)
    const media = Array.from({ length: count }, (_, offset) => pool[(index + offset) % pool.length])
    const current = byAuthor.get(entry.author)
    const french = {
      author: entry.author,
      consent: true,
      media,
      rating: entry.rating,
      service: choices[index % choices.length],
      status: 'publie' as const,
      text: entry.text.fr,
    }
    const saved = current
      ? await payload.update({
          collection: 'reviews',
          id: current.id,
          locale: 'fr',
          overrideAccess: true,
          context: { allowStatus: true },
          data: french,
        })
      : await payload.create({
          collection: 'reviews',
          locale: 'fr',
          overrideAccess: true,
          context: { allowStatus: true },
          data: french,
        })
    await payload.update({
      collection: 'reviews',
      id: saved.id,
      locale: 'en',
      fallbackLocale: false,
      overrideAccess: true,
      data: { text: entry.text.en },
    })
    if (current) updated += 1
    else created += 1
  }

  const perCategory = [...seen.entries()].map(([slug, count]) => `${slug} ${count}`).join(', ')
  console.log(`${created} avis créé(s), ${updated} mis à jour. ${perCategory}. Tous sont publiés.`)
} finally {
  await payload.destroy()
}
