import type { Metadata } from 'next'

import { PagePlaceholder } from '@/components/site/page-placeholder'

export const metadata: Metadata = {
  title: 'Services',
}

export default function ServicesPage() {
  return (
    <PagePlaceholder
      eyebrow="Services"
      title="Automobile, résidentiel, commercial et spécialisé."
      description="Le catalogue et les fiches détaillées seront affichés ici, à partir des services publiés dans l’administration."
    />
  )
}