import type { Metadata } from 'next'

import { HomeView } from '@/components/site/home-view'
import { site } from '@/config/site'
import { getT } from '@/i18n/server'
import { loadHome } from '@/lib/home'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: { absolute: `${t('nav.home')} — ${site.name}` } }
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const content = await loadHome()
  return <HomeView content={content} />
}
