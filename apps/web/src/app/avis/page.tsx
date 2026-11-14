import type { Metadata } from 'next'

import { ReviewsBoard, type ReviewFocus, type ReviewService } from '@/components/site/reviews-board'
import { getLocale, getT } from '@/i18n/server'
import { withLocale } from '@/i18n/locale'
import { loadReviewCards } from '@/lib/reviews'
import { API_URL } from '@repo/api'
import type { Service } from '@repo/types'

type ListResponse<T> = { docs?: T[] }

async function readServices(): Promise<ReviewService[]> {
  const locale = await getLocale()
  try {
    const response = await fetch(`${API_URL}${withLocale('/services?limit=100&depth=0&sort=title', locale)}`, {
      cache: 'no-store',
    })
    if (!response.ok) return []
    const body = (await response.json()) as ListResponse<Service>
    return (body.docs ?? []).flatMap((service) =>
      service.title && service.slug ? [{ id: service.id, slug: service.slug, title: service.title }] : [],
    )
  } catch {
    return []
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('reviews.metaTitle') }
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>
}) {
  const query = (await searchParams).service
  const slug = Array.isArray(query) ? query[0] : query
  const [cards, services] = await Promise.all([loadReviewCards(), readServices()])
  const match = slug ? services.find((service) => service.slug === slug) : undefined
  const focus: ReviewFocus | null = match ? { id: match.id, slug: match.slug, title: match.title } : null
  const banner = cards.flatMap((card) => card.photos).find((photo) => !photo.video)?.src || '/construction.png'
  return <ReviewsBoard banner={banner} focus={focus} reviews={cards} services={services} />
}
