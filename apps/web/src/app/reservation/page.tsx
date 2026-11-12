import type { Metadata } from 'next'

import { PagePlaceholder } from '@/components/site/page-placeholder'

export const metadata: Metadata = {
  title: 'Prendre rendez-vous',
}

export default function ReservationPage() {
  return (
    <PagePlaceholder
      eyebrow="Réservation"
      title="La demande de rendez-vous se fera en quatre étapes."
      description="Le choix du service, de la date, des coordonnées et la confirmation seront branchés lorsque le catalogue existera."
    />
  )
}