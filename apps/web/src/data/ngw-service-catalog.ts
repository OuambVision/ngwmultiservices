export const NGW_CATEGORY_ORDER = [
  'NGW_Automotive',
  'NGW_Commercial',
  'NGW_Residential',
  'NGW_Specialized',
  'NGW_AllServices',
] as const

export type NgwCategoryName = (typeof NGW_CATEGORY_ORDER)[number]

const AUTOMOTIVE_SERVICES = [
  'Nettoyage intérieur',
  'Nettoyage extérieur',
  'Nettoyage complet',
  'Sièges et tapis',
  'Tableau de bord',
  'Camionnettes et VUS',
] as const

const COMMERCIAL_SERVICES = [
  'Commerces et institutions',
  'Entrepôts et espaces communs',
  'Planchers et vitres',
] as const

const RESIDENTIAL_SERVICES = [
  'Grand ménage et entretien régulier',
  'Maisons, appartements et condos',
  'Cuisines et salles de bain',
  'Tapis, moquettes et meubles',
] as const

const SPECIALIZED_SERVICES = [
  'Nettoyage après construction',
  'Nettoyage après sinistre',
  'Désinfection et assainissement',
] as const

export const NGW_CATEGORY_SERVICES = {
  NGW_Automotive: AUTOMOTIVE_SERVICES,
  NGW_Commercial: COMMERCIAL_SERVICES,
  NGW_Residential: RESIDENTIAL_SERVICES,
  NGW_Specialized: SPECIALIZED_SERVICES,
} as const

export const NGW_ALL_SERVICES = [
  ...AUTOMOTIVE_SERVICES,
  ...COMMERCIAL_SERVICES,
  ...RESIDENTIAL_SERVICES,
  ...SPECIALIZED_SERVICES,
] as const

export function getCategoryServices(name: string) {
  if (name === 'NGW_AllServices') return NGW_ALL_SERVICES
  return NGW_CATEGORY_SERVICES[name as keyof typeof NGW_CATEGORY_SERVICES] ?? []
}

const AUTOMOTIVE_SERVICES_EN = [
  'Interior cleaning',
  'Exterior cleaning',
  'Complete cleaning',
  'Seats and carpets',
  'Dashboard',
  'Vans and SUVs',
] as const

const COMMERCIAL_SERVICES_EN = [
  'Shops and institutions',
  'Warehouses and common areas',
  'Floors and windows',
] as const

const RESIDENTIAL_SERVICES_EN = [
  'Deep clean and regular upkeep',
  'Houses, apartments and condos',
  'Kitchens and bathrooms',
  'Rugs, carpeting and furniture',
] as const

const SPECIALIZED_SERVICES_EN = [
  'Post-construction cleaning',
  'Post-disaster cleaning',
  'Disinfection and sanitizing',
] as const

export type CategoryServiceLink = {
  href: string
  label: string
}

export type CategoryCardCopy = {
  eyebrow: string
  href: string
  services: readonly CategoryServiceLink[]
  title: string
}

const CATEGORY_HREFS: Record<NgwCategoryName, string> = {
  NGW_Automotive: '/services/automobile',
  NGW_Commercial: '/services/commercial',
  NGW_Residential: '/services/residentiel',
  NGW_Specialized: '/services/specialise',
  NGW_AllServices: '/services',
}

const AUTOMOTIVE_HREFS = [
  '/services/automobile/nettoyage-interieur',
  '/services/automobile/lavage-exterieur',
  '/services/automobile/detail-complet',
  '/services/automobile/sieges-et-tapis',
  '/services/automobile/tableau-de-bord',
  '/services/automobile/camionnettes-et-vus',
] as const

const COMMERCIAL_HREFS = [
  '/services/commercial/commerces-et-institutions',
  '/services/commercial/entrepots-et-espaces-communs',
  '/services/commercial/planchers-et-vitres',
] as const

const RESIDENTIAL_HREFS = [
  '/services/residentiel/grand-menage-et-entretien-regulier',
  '/services/residentiel/maisons-appartements-condos',
  '/services/residentiel/cuisines-et-salles-de-bain',
  '/services/residentiel/tapis-moquettes-et-meubles',
] as const

const SPECIALIZED_HREFS = [
  '/services/specialise/nettoyage-apres-construction',
  '/services/specialise/nettoyage-apres-sinistre',
  '/services/specialise/desinfection-et-assainissement',
] as const

const ALL_HREFS = [
  ...AUTOMOTIVE_HREFS,
  ...COMMERCIAL_HREFS,
  ...RESIDENTIAL_HREFS,
  ...SPECIALIZED_HREFS,
] as const

function linkServices(labels: readonly string[], hrefs: readonly string[]): CategoryServiceLink[] {
  return labels.map((label, index) => ({ label, href: hrefs[index] ?? '/services' }))
}

export function categoryPageHref(name: string) {
  if (name in CATEGORY_HREFS) return CATEGORY_HREFS[name as NgwCategoryName]
  return null
}

const FRENCH_CARDS: Record<NgwCategoryName, CategoryCardCopy> = {
  NGW_Automotive: {
    eyebrow: 'Automobile',
    title: 'Nettoyage Automobile',
    href: CATEGORY_HREFS.NGW_Automotive,
    services: linkServices(AUTOMOTIVE_SERVICES, AUTOMOTIVE_HREFS),
  },
  NGW_Commercial: {
    eyebrow: 'Commercial',
    title: 'Nettoyage Commercial',
    href: CATEGORY_HREFS.NGW_Commercial,
    services: linkServices(COMMERCIAL_SERVICES, COMMERCIAL_HREFS),
  },
  NGW_Residential: {
    eyebrow: 'Résidentiel',
    title: 'Nettoyage Résidentiel',
    href: CATEGORY_HREFS.NGW_Residential,
    services: linkServices(RESIDENTIAL_SERVICES, RESIDENTIAL_HREFS),
  },
  NGW_Specialized: {
    eyebrow: 'Spécialisé',
    title: 'Nettoyage Spécialisé',
    href: CATEGORY_HREFS.NGW_Specialized,
    services: linkServices(SPECIALIZED_SERVICES, SPECIALIZED_HREFS),
  },
  NGW_AllServices: {
    eyebrow: 'Catalogue',
    title: 'Tous les services',
    href: CATEGORY_HREFS.NGW_AllServices,
    services: linkServices(NGW_ALL_SERVICES, ALL_HREFS),
  },
}

const ENGLISH_CARDS: Record<NgwCategoryName, CategoryCardCopy> = {
  NGW_Automotive: {
    eyebrow: 'Automotive',
    title: 'Automotive cleaning',
    href: CATEGORY_HREFS.NGW_Automotive,
    services: linkServices(AUTOMOTIVE_SERVICES_EN, AUTOMOTIVE_HREFS),
  },
  NGW_Commercial: {
    eyebrow: 'Commercial',
    title: 'Commercial cleaning',
    href: CATEGORY_HREFS.NGW_Commercial,
    services: linkServices(COMMERCIAL_SERVICES_EN, COMMERCIAL_HREFS),
  },
  NGW_Residential: {
    eyebrow: 'Residential',
    title: 'Residential cleaning',
    href: CATEGORY_HREFS.NGW_Residential,
    services: linkServices(RESIDENTIAL_SERVICES_EN, RESIDENTIAL_HREFS),
  },
  NGW_Specialized: {
    eyebrow: 'Specialized',
    title: 'Specialized cleaning',
    href: CATEGORY_HREFS.NGW_Specialized,
    services: linkServices(SPECIALIZED_SERVICES_EN, SPECIALIZED_HREFS),
  },
  NGW_AllServices: {
    eyebrow: 'Catalogue',
    title: 'All services',
    href: CATEGORY_HREFS.NGW_AllServices,
    services: linkServices(
      [
        ...AUTOMOTIVE_SERVICES_EN,
        ...COMMERCIAL_SERVICES_EN,
        ...RESIDENTIAL_SERVICES_EN,
        ...SPECIALIZED_SERVICES_EN,
      ],
      ALL_HREFS,
    ),
  },
}

export function getCategoryCard(name: string, locale: string): CategoryCardCopy | null {
  const cards = locale.startsWith('en') ? ENGLISH_CARDS : FRENCH_CARDS
  if (name in cards) return cards[name as NgwCategoryName]
  return null
}
