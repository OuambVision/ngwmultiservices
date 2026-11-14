import { getLocale } from '@/i18n/server'
import { withLocale } from '@/i18n/locale'
import { API_URL } from '@repo/api'
import type { Category, Media, Review } from '@repo/types'

type ListResponse<T> = { docs?: T[] }

export type ReviewCard = {
  author: string
  categorySlug: string
  categoryTitle: string
  date: string
  id: number
  photos: Array<{ alt: string; src: string; video: boolean }>
  rating: number
  serviceId: number
  serviceSlug: string
  serviceTitle: string
  text: string
}

export type ServiceScore = {
  average: number
  count: number
}

const familyOrder = ['automobile', 'residentiel', 'commercial', 'specialise'] as const

function categoryOf(service: Review['service']): Category | null {
  if (!service || typeof service !== 'object') return null
  const category = service.category
  if (!category || typeof category !== 'object' || !category.slug) return null
  return category
}

export function scoresByService(cards: ReviewCard[]) {
  const groups = new Map<number, ReviewCard[]>()
  for (const card of cards) {
    const list = groups.get(card.serviceId) ?? []
    list.push(card)
    groups.set(card.serviceId, list)
  }
  const byId: Record<number, ServiceScore> = {}
  const bySlug: Record<string, ServiceScore> = {}
  for (const [id, list] of groups) {
    const score = {
      average: list.reduce((sum, card) => sum + card.rating, 0) / list.length,
      count: list.length,
    }
    byId[id] = score
    const slug = list[0]?.serviceSlug
    if (slug) bySlug[slug] = score
  }
  return { byId, bySlug }
}

export function mixedReviews(reviews: ReviewCard[], count = 6) {
  const groups = familyOrder.map((slug) => reviews.filter((review) => review.categorySlug === slug))
  const picked: ReviewCard[] = []
  let row = 0
  while (picked.length < count) {
    const before = picked.length
    for (const group of groups) {
      const review = group[row]
      if (!review) continue
      picked.push(review)
      if (picked.length === count) break
    }
    if (picked.length === before) break
    row += 1
  }
  return picked
}

export async function loadReviewCards(): Promise<ReviewCard[]> {
  const locale = await getLocale()
  const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-CA' : 'fr-CA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  try {
    const response = await fetch(`${API_URL}${withLocale('/reviews?limit=100&depth=2&sort=-createdAt', locale)}`, {
      cache: 'no-store',
    })
    if (!response.ok) return []
    const body = (await response.json()) as ListResponse<Review>
    return (body.docs ?? []).flatMap((review) => {
      const category = categoryOf(review.service)
      const service = review.service
      const serviceTitle = typeof service === 'object' ? service.title : ''
      const serviceSlug = typeof service === 'object' ? service.slug : ''
      const serviceId = typeof service === 'object' ? service.id : 0
      if (!category?.slug || !review.author || !serviceTitle || !serviceSlug || !serviceId) return []
      const photos = (review.media ?? []).flatMap((item) => {
        if (!item || typeof item !== 'object' || !item.url) return []
        const media = item as Media
        return [
          {
            alt: media.alt?.trim() || review.author,
            src: media.url as string,
            video: Boolean(media.mimeType?.startsWith('video/')),
          },
        ]
      })
      return [
        {
          author: review.author,
          categorySlug: category.slug,
          categoryTitle: category.title,
          date: dateFormat.format(new Date(review.createdAt)),
          id: review.id,
          photos: photos.slice(0, 5),
          rating: review.rating,
          serviceId,
          serviceSlug,
          serviceTitle,
          text: review.text,
        },
      ]
    })
  } catch {
    return []
  }
}
