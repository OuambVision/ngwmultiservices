import type { Metadata } from 'next'

import { PagePlaceholder } from '@/components/site/page-placeholder'
import { getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('account.metaTitle') }
}

export default async function ClientSpacePage() {
  const t = await getT()
  return (
    <PagePlaceholder
      eyebrow={t('account.eyebrow')}
      title={t('account.title')}
      description={t('account.description')}
    />
  )
}
