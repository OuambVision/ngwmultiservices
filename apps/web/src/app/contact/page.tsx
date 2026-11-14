import type { Metadata } from 'next'

import { ContactPageView } from '@/components/site/contact-page'
import { getT } from '@/i18n/server'
import { loadSiteContact } from '@/lib/site-contact'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('contact.metaTitle') }
}

export default async function ContactPage() {
  const contact = await loadSiteContact()
  return <ContactPageView contact={contact} />
}
