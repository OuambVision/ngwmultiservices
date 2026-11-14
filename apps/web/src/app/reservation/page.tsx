import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ReservationWizard } from '@/components/site/reservation-wizard'
import type { ReservationCategory, ReservationService } from '@/components/site/reservation-types'
import { getLocale, getT } from '@/i18n/server'
import {
  categoryOf,
  formatPrice,
  loadCategories,
  loadCategoryServices,
  loadService,
  serviceImage,
} from '@/lib/catalog'
import { loadReviewCards, scoresByService } from '@/lib/reviews'
import type { Category, Service } from '@repo/types'

type PageProps = {
  searchParams: Promise<{ service?: string | string[] }>
}

function toOption(
  service: Service,
  category: Category,
  locale: string,
  score?: { average: number; count: number },
): ReservationService | null {
  if (!service.slug || !category.slug || typeof service.id !== 'number') return null
  const image = serviceImage(service)
  return {
    categorySlug: category.slug,
    categoryTitle: category.title,
    duration: service.duration ?? '',
    id: service.id,
    image: image.src,
    imageAlt: image.alt,
    included: (service.included ?? []).flatMap((row) => (row.item ? [row.item] : [])),
    place: service.place ?? '',
    price: typeof service.priceFrom === 'number' ? formatPrice(service.priceFrom, locale) : '',
    ratingAverage: score?.average ?? 0,
    ratingCount: score?.count ?? 0,
    slug: service.slug,
    summary: service.summary ?? '',
    title: service.title,
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('reservation.metaTitle') }
}

export default async function ReservationPage({ searchParams }: PageProps) {
  const locale = await getLocale()
  const query = (await searchParams).service
  const slug = Array.isArray(query) ? query[0] : query
  const [categories, reviews] = await Promise.all([loadCategories(), loadReviewCards()])
  const ratings = scoresByService(reviews).byId
  const groups = (
    await Promise.all(
      categories.map(async (category) => {
        const services = await loadCategoryServices(category.id)
        const options = services.flatMap((service) => {
          const option = toOption(service, category, locale, ratings[service.id])
          return option ? [option] : []
        })
        if (!category.slug || options.length === 0) return []
        return [{ slug: category.slug, title: category.title, services: options } satisfies ReservationCategory]
      }),
    )
  ).flat()

  if (slug) {
    const chosen = await loadService(slug)
    const category = chosen ? categoryOf(chosen) : null
    const listed = groups.some((group) => group.services.some((service) => service.slug === slug))
    if (!chosen || !category || category.slug == null || !listed) notFound()
  }

  return <ReservationWizard categories={groups} initialSlug={slug} />
}
