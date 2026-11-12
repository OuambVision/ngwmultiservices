import type { Metadata } from 'next'

import { PagePlaceholder } from '@/components/site/page-placeholder'

export const metadata: Metadata = {
  title: 'Réalisations',
}

export default function RealisationsPage() {
  return (
    <PagePlaceholder
      eyebrow="Réalisations"
      title="Les chantiers publiés apparaîtront ici."
      description="Seules les photos autorisées et marquées comme publiées seront visibles. Aucune réalisation n’est inventée en attendant."
    />
  )
}