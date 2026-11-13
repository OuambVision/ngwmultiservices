import type { Metadata } from 'next'

import { PagePlaceholder } from '@/components/site/page-placeholder'
import { getT } from '@/i18n/server'
import { loadSiteContact } from '@/lib/site-contact'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('contact.metaTitle') }
}

export default async function ContactPage() {
  const t = await getT()
  const contact = await loadSiteContact()
  return (
    <PagePlaceholder
      eyebrow={t('contact.eyebrow')}
      title={t('contact.title')}
      description={t('contact.description', {
        phone: contact.phoneDisplay,
        email: contact.email,
        area: contact.area,
      })}
    />
  )
}
