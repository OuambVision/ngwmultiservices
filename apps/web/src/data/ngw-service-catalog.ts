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

export type CategoryCardCopy = {
  eyebrow: string
  title: string
  services: readonly string[]
}

const FRENCH_CARDS: Record<NgwCategoryName, CategoryCardCopy> = {
  NGW_Automotive: {
    eyebrow: 'Automobile',
    title: 'Nettoyage Automobile',
    services: AUTOMOTIVE_SERVICES,
  },
  NGW_Commercial: {
    eyebrow: 'Commercial',
    title: 'Nettoyage Commercial',
    services: COMMERCIAL_SERVICES,
  },
  NGW_Residential: {
    eyebrow: 'Résidentiel',
    title: 'Nettoyage Résidentiel',
    services: RESIDENTIAL_SERVICES,
  },
  NGW_Specialized: {
    eyebrow: 'Spécialisé',
    title: 'Nettoyage Spécialisé',
    services: SPECIALIZED_SERVICES,
  },
  NGW_AllServices: {
    eyebrow: 'Catalogue',
    title: 'Tous les services',
    services: NGW_ALL_SERVICES,
  },
}

const ENGLISH_CARDS: Record<NgwCategoryName, CategoryCardCopy> = {
  NGW_Automotive: {
    eyebrow: 'Automotive',
    title: 'Automotive cleaning',
    services: AUTOMOTIVE_SERVICES_EN,
  },
  NGW_Commercial: {
    eyebrow: 'Commercial',
    title: 'Commercial cleaning',
    services: COMMERCIAL_SERVICES_EN,
  },
  NGW_Residential: {
    eyebrow: 'Residential',
    title: 'Residential cleaning',
    services: RESIDENTIAL_SERVICES_EN,
  },
  NGW_Specialized: {
    eyebrow: 'Specialized',
    title: 'Specialized cleaning',
    services: SPECIALIZED_SERVICES_EN,
  },
  NGW_AllServices: {
    eyebrow: 'Catalogue',
    title: 'All services',
    services: [
      ...AUTOMOTIVE_SERVICES_EN,
      ...COMMERCIAL_SERVICES_EN,
      ...RESIDENTIAL_SERVICES_EN,
      ...SPECIALIZED_SERVICES_EN,
    ],
  },
}

export function getCategoryCard(name: string, locale: string): CategoryCardCopy | null {
  const cards = locale.startsWith('en') ? ENGLISH_CARDS : FRENCH_CARDS
  if (name in cards) return cards[name as NgwCategoryName]
  return null
}
