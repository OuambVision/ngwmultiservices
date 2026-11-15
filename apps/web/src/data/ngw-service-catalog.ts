export const NGW_CATEGORY_ORDER = [
  'NGW_Automotive',
  'NGW_Commercial',
  'NGW_Residential',
  'NGW_Specialized',
  'NGW_Demenagement',
  'NGW_PetiteMaintenance',
] as const

export type NgwCategoryName = (typeof NGW_CATEGORY_ORDER)[number]

/** GLB mesh name → Payload category slug */
export const NGW_CATEGORY_SLUGS: Record<NgwCategoryName, string> = {
  NGW_Automotive: 'automobile',
  NGW_Commercial: 'commercial',
  NGW_Residential: 'residentiel',
  NGW_Specialized: 'specialise',
  NGW_Demenagement: 'demenagement',
  NGW_PetiteMaintenance: 'petite-maintenance',
}

export type CategoryServiceLink = {
  href: string
  label: string
}

export type CategoryCardCopy = {
  eyebrow: string
  href: string
  imageAlt: string
  imageSrc: string
  services: readonly CategoryServiceLink[]
  title: string
}

export type OrbitCategoryCards = Partial<Record<NgwCategoryName, CategoryCardCopy>>

type CatalogService = {
  order?: number | null
  published?: boolean | null
  slug?: string | null
  title: string
}

type CatalogCategory = {
  image?: { alt?: string | null; url?: string | null } | number | null
  services: CatalogService[]
  slug?: string | null
  title: string
}

const CATEGORY_IMAGE_FALLBACKS: Record<string, string> = {
  automobile: '/3d/services/nettoyage-auto.png',
  residentiel: '/3d/services/nettoyage-residentiel.png',
  commercial: '/3d/services/nettoyage-commercial.png',
  specialise: '/3d/services/nettoyage-specialise.png',
  demenagement: '/3d/services/demenagement.png',
  'petite-maintenance': '/3d/services/petite-maintenance.png',
}

function categoryCardImage(category: CatalogCategory, slug: string) {
  const image = category.image
  if (image && typeof image === 'object' && image.url) {
    return { src: image.url, alt: image.alt?.trim() || category.title }
  }
  return {
    src: CATEGORY_IMAGE_FALLBACKS[slug] ?? '/3d/services/tous-services.png',
    alt: category.title,
  }
}

export function categoryPageHref(name: string) {
  if (name in NGW_CATEGORY_SLUGS) {
    return `/services/${NGW_CATEGORY_SLUGS[name as NgwCategoryName]}`
  }
  return null
}

export function ngwNameForSlug(slug: string): NgwCategoryName | null {
  const entry = (Object.entries(NGW_CATEGORY_SLUGS) as [NgwCategoryName, string][]).find(
    ([, value]) => value === slug,
  )
  return entry?.[0] ?? null
}

/** Build home/orbit cards from Payload categories + nested services. */
export function buildOrbitCategoryCards(categories: CatalogCategory[]): OrbitCategoryCards {
  const bySlug = new Map<string, CatalogCategory>()
  for (const category of categories) {
    if (!category.slug) continue
    bySlug.set(category.slug, category)
  }

  const cards: OrbitCategoryCards = {}
  for (const name of NGW_CATEGORY_ORDER) {
    const slug = NGW_CATEGORY_SLUGS[name]
    const category = bySlug.get(slug)
    if (!category) continue

    const services = [...category.services]
      .filter((service) => Boolean(service.slug) && service.published !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((service) => ({
        label: service.title,
        href: `/services/${slug}/${service.slug}`,
      }))

    const image = categoryCardImage(category, slug)
    cards[name] = {
      eyebrow: category.title,
      title: category.title,
      href: `/services/${slug}`,
      imageAlt: image.alt,
      imageSrc: image.src,
      services,
    }
  }

  return cards
}

/** Legacy dive-orbit labels (mesh object names in older GLB scenes). */
export const NGW_CATEGORY_SERVICES = {
  NGW_Automotive: [
    'Nettoyage intérieur',
    'Nettoyage extérieur',
    'Nettoyage complet',
    'Sièges et tapis',
    'Tableau de bord',
    'Camionnettes et VUS',
  ],
  NGW_Commercial: [
    'Commerces et institutions',
    'Entrepôts et espaces communs',
    'Planchers et vitres',
  ],
  NGW_Residential: [
    'Grand ménage et entretien régulier',
    'Maisons, appartements et condos',
    'Cuisines et salles de bain',
    'Tapis, moquettes et meubles',
  ],
  NGW_Specialized: [
    'Nettoyage après construction',
    'Nettoyage après sinistre',
    'Désinfection et assainissement',
  ],
  NGW_Demenagement: [
    'Emballage des effets',
    'Démontage et assemblage des meubles',
    'Protection et emballage des meubles',
    'Collecte des effets à domicile',
    'Manutention des meubles',
    'Chargement du camion',
    'Transport local et interurbain',
    'Déchargement du camion',
    'Rangement des effets',
  ],
  NGW_PetiteMaintenance: [
    'Installation de tringles à rideaux',
    'Fixation des tableaux décoratifs',
    'Installation des cadres et miroirs muraux',
    'Installation et fixation des télévisions murales',
    "Montage d'armoires, placards, lits, bureaux, tables et chaises",
    'Changement de serrures et poignées des portes',
    'Rénovation des peintures',
  ],
} as const

export function getCategoryServices(name: string) {
  return NGW_CATEGORY_SERVICES[name as keyof typeof NGW_CATEGORY_SERVICES] ?? []
}
