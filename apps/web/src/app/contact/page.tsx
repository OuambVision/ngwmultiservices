import type { Metadata } from 'next'

import { PagePlaceholder } from '@/components/site/page-placeholder'
import { site } from '@/config/site'

export const metadata: Metadata = {
  title: 'Contact',
}

export default function ContactPage() {
  return (
    <PagePlaceholder
      eyebrow="Contact"
      title="Écrire ou appeler NGW."
      description={`Téléphone ${site.phoneDisplay}. Courriel ${site.email}. Zone : ${site.area}. Le formulaire de contact viendra avec la page complète.`}
    />
  )
}