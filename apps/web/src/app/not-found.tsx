import { PagePlaceholder } from '@/components/site/page-placeholder'
import { getT } from '@/i18n/server'

export default async function NotFound() {
  const t = await getT()
  return (
    <PagePlaceholder eyebrow="404" title={t('notFound.title')} description={t('notFound.description')} />
  )
}
