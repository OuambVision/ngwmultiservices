import type { Metadata } from 'next'

import { PagePlaceholder } from '@/components/site/page-placeholder'
import { getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('projects.metaTitle') }
}

export default async function RealisationsPage() {
  const t = await getT()
  return (
    <PagePlaceholder
      eyebrow={t('projects.eyebrow')}
      title={t('projects.title')}
      description={t('projects.description')}
    />
  )
}
