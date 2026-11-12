import type { Metadata } from 'next'

import { PagePlaceholder } from '@/components/site/page-placeholder'

export const metadata: Metadata = {
  title: 'À propos',
}

export default function AboutPage() {
  return (
    <PagePlaceholder
      eyebrow="À propos"
      title="NGW MULTISERVICES"
      description="La présentation de l’entreprise, sa zone et sa façon de travailler seront rédigées avec les textes fournis par NGW."
    />
  )
}