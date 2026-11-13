import type { Metadata } from 'next'

import { PagePlaceholder } from '@/components/site/page-placeholder'
import { getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('quote.metaTitle') }
}

export default async function QuotePage() {
  const t = await getT()
  return (
    <PagePlaceholder eyebrow={t('quote.eyebrow')} title={t('quote.title')} description={t('quote.description')} />
  )
}
