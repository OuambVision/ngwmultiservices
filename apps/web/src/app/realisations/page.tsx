import type { Metadata } from 'next'

import { RealizationsGallery, type RealizationCard } from '@/components/site/realizations-gallery'
import { getLocale, getT } from '@/i18n/server'
import { withLocale } from '@/i18n/locale'
import { serviceFallbackSrc } from '@/lib/catalog'
import { API_URL } from '@repo/api'
import type { Category, Media, Realization } from '@repo/types'

const categoryFallbacks: Record<string, string> = {
  automobile: '/3d/services/nettoyage-auto.png',
  commercial: '/3d/services/nettoyage-commercial.png',
  residentiel: '/3d/services/nettoyage-residentiel.png',
  specialise: '/3d/services/nettoyage-specialise.png',
}

type ListResponse<T> = { docs?: T[] }

async function readList<T>(path: string): Promise<T[]> {
  const locale = await getLocale()
  try {
    const response = await fetch(`${API_URL}${withLocale(path, locale)}`, { cache: 'no-store' })
    if (!response.ok) return []
    const body = (await response.json()) as ListResponse<T>
    return body.docs ?? []
  } catch {
    return []
  }
}

function photoOf(realization: Realization): Media | null {
  const first = realization.photos?.find((item) => item && typeof item === 'object' && item.url)
  return first && typeof first === 'object' ? first : null
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('projects.metaTitle') }
}

export default async function RealisationsPage() {
  const [categories, realizations] = await Promise.all([
    readList<Category>('/categories?limit=20&sort=order&depth=0'),
    readList<Realization>('/realizations?limit=100&depth=1&sort=createdAt'),
  ])
  const cards: RealizationCard[] = realizations.flatMap((realization) => {
    const category = realization.category
    if (!category || typeof category !== 'object' || !category.slug || !realization.slug) return []
    const photo = photoOf(realization)
    return [
      {
        categorySlug: category.slug,
        categoryTitle: category.title,
        id: realization.id,
        image: photo?.url || categoryFallbacks[category.slug] || serviceFallbackSrc,
        imageAlt: photo?.alt?.trim() || realization.title,
        slug: realization.slug,
        summary: realization.summary ?? '',
        title: realization.title,
      },
    ]
  })

  return (
    <RealizationsGallery
      cards={cards}
      categories={categories.flatMap((category) =>
        category.slug ? [{ slug: category.slug, title: category.title }] : [],
      )}
    />
  )
}
