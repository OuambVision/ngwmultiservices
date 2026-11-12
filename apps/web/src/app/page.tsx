import type { Metadata } from 'next'

import { PagePlaceholder } from '@/components/site/page-placeholder'

export const metadata: Metadata = {
  title: 'Accueil',
}

export default function HomePage() {
  return (
    <PagePlaceholder
      eyebrow="NGW Cleaning Services"
      title="Nettoyage professionnel à Ottawa et environs."
      description="L’accueil présentera bientôt les services, les réalisations et les deux actions : prendre rendez-vous ou demander une soumission."
    />
  )
}