import type { Metadata } from 'next'

import { PagePlaceholder } from '@/components/site/page-placeholder'

export const metadata: Metadata = {
  title: 'Espace client',
}

export default function ClientSpacePage() {
  return (
    <PagePlaceholder
      eyebrow="Espace client"
      title="Vos réservations, devis et factures."
      description="La connexion et le suivi des demandes seront disponibles lorsque les comptes clients seront en place."
    />
  )
}