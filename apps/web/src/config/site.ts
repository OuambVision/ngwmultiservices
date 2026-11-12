export const site = {
  name: 'NGW Cleaning Services',
  legalName: 'NGW MULTISERVICES',
  tagline: 'Cleaning . Moving . Maintenance',
  description: 'Nettoyage automobile, résidentiel, commercial et spécialisé à Ottawa et environs.',
  phoneDisplay: '613-698-2837',
  phoneHref: 'tel:+16136982837',
  email: 'ngwmultiservice@gmail.com',
  area: 'Ottawa et environs',
  locality: 'Ottawa, Ontario',
} as const

export const mainNav = [
  { href: '/', label: 'Accueil' },
  { href: '/services', label: 'Services' },
  { href: '/realisations', label: 'Réalisations' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
] as const

export const serviceFamilies = [
  { label: 'Automobile', href: '/services' },
  { label: 'Résidentiel', href: '/services' },
  { label: 'Commercial', href: '/services' },
  { label: 'Spécialisé', href: '/services' },
] as const

export const reservationHref = '/reservation'
export const clientSpaceHref = '/espace-client'
