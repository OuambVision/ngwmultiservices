import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { API_URL } from '@repo/api'
import type { Category } from '@repo/types'

import { PagePlaceholder } from '@/components/site/page-placeholder'
import { withLocale } from '@/i18n/locale'
import { getLocale, getT } from '@/i18n/server'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getT()
  const category = await loadCategory((await params).slug)
  return { title: category?.title ?? t('services.metaTitle') }
}

export default async function ServiceFamilyPage({ params }: PageProps) {
  const t = await getT()
  const locale = await getLocale()
  const category = await loadCategory((await params).slug)
  if (!category) notFound()

  return (
    <PagePlaceholder
      eyebrow={category.title}
      title={t('services.familyTitle', { title: category.title.toLocaleLowerCase(locale) })}
      description={t('services.familyDescription')}
    />
  )
}

async function loadCategory(slug: string): Promise<Category | null> {
  const locale = await getLocale()
  try {
    const response = await fetch(
      `${API_URL}${withLocale(`/categories?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=0`, locale)}`,
      { cache: 'no-store' },
    )
    if (!response.ok) return null
    const body = (await response.json()) as { docs?: Category[] }
    return body.docs?.[0] ?? null
  } catch {
    return null
  }
}
