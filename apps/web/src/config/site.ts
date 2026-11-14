export const site = {
  name: 'NGW MULTISERVICES',
  legalName: 'NGW MULTISERVICES',
  tagline: 'Cleaning . Moving . Maintenance',
  description: 'Nettoyage automobile, résidentiel, commercial et spécialisé à Ottawa et environs.',
  phoneDisplay: '613-698-2837',
  phoneHref: 'tel:+16136982837',
  email: 'ngwmultiservice@gmail.com',
  area: 'Ottawa • Gatineau • Orléans • Kanata',
  locality: 'Ottawa, Ontario',
} as const

export const mainNav = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/services', labelKey: 'nav.services' },
  { href: '/realisations', labelKey: 'nav.projects' },
  { href: '/contact', labelKey: 'nav.contact' },
] as const

export const serviceFamilies = [
  { href: '/services/automobile', labelKey: 'families.automotive' },
  { href: '/services/residentiel', labelKey: 'families.residential' },
  { href: '/services/commercial', labelKey: 'families.commercial' },
  { href: '/services/specialise', labelKey: 'families.specialized' },
] as const

export const reservationHref = '/reservation'

export function reservationHrefFor(serviceSlug: string) {
  return `${reservationHref}?service=${encodeURIComponent(serviceSlug)}`
}
export const quoteHref = '/soumission'
export const clientSpaceHref = '/espace-client'
