import { API_URL } from '@repo/api'
import type { Category, Media, Service } from '@repo/types'

import { withLocale } from '@/i18n/locale'
import { getLocale } from '@/i18n/server'

type ListResponse<T> = {
  docs?: T[]
}

async function readJson<T>(path: string): Promise<T | null> {
  const locale = await getLocale()
  try {
    const response = await fetch(`${API_URL}${withLocale(path, locale)}`, { cache: 'no-store' })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

export const serviceFallbackSrc = '/3d/services/tous-services.png'

const categoryFallbacks: Record<string, string> = {
  automobile: '/3d/services/nettoyage-auto.png',
  residentiel: '/3d/services/nettoyage-residentiel.png',
  commercial: '/3d/services/nettoyage-commercial.png',
  specialise: '/3d/services/nettoyage-specialise.png',
}

export async function loadCategories(): Promise<Category[]> {
  const body = await readJson<ListResponse<Category>>('/categories?limit=20&sort=order&depth=1')
  return body?.docs ?? []
}

export async function loadCategory(slug: string): Promise<Category | null> {
  const body = await readJson<ListResponse<Category>>(
    `/categories?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=1`,
  )
  return body?.docs?.[0] ?? null
}

export async function loadServices(): Promise<Service[]> {
  const body = await readJson<ListResponse<Service>>('/services?limit=100&depth=1&sort=order')
  return body?.docs ?? []
}

export async function loadCategoryServices(categoryId: number): Promise<Service[]> {
  const body = await readJson<ListResponse<Service>>(
    `/services?where[category][equals]=${categoryId}&sort=order&limit=100&depth=1`,
  )
  return body?.docs ?? []
}

export async function loadService(slug: string): Promise<Service | null> {
  const body = await readJson<ListResponse<Service>>(
    `/services?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=1`,
  )
  return body?.docs?.[0] ?? null
}

export function categoryOf(service: Service): Category | null {
  return typeof service.category === 'object' && service.category ? service.category : null
}

export function servicePhoto(service: Service): Media | null {
  return service.photo && typeof service.photo === 'object' ? service.photo : null
}

export function serviceImage(service: Service): { alt: string; src: string } {
  const photo = servicePhoto(service)
  if (photo?.url) return { src: photo.url, alt: photo.alt?.trim() || service.title }
  return { src: serviceFallbackSrc, alt: service.title }
}

export function serviceSlides(service: Service): { alt: string; src: string }[] {
  const photo = servicePhoto(service)
  const main = photo?.url
    ? { src: photo.url, alt: photo.alt?.trim() || service.title }
    : null
  const extras = (service.photos ?? []).flatMap((item) => {
    if (!item || typeof item !== 'object' || !item.url || item.url === main?.src) return []
    return [{ src: item.url, alt: item.alt?.trim() || service.title }]
  })
  const slides = [...(main ? [main] : []), ...extras]
  return slides.length > 0 ? slides.slice(0, 6) : [serviceImage(service)]
}

export function categoryImage(category: Category): { alt: string; src: string } | null {
  const image = category.image
  if (image && typeof image === 'object' && image.url) {
    return { src: image.url, alt: image.alt?.trim() || category.title }
  }
  const fallback = category.slug ? categoryFallbacks[category.slug] : undefined
  return fallback ? { src: fallback, alt: category.title } : null
}

export function formatPrice(amount: number, locale: string) {
  return new Intl.NumberFormat(locale.startsWith('en') ? 'en-CA' : 'fr-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function richTextParagraphs(value: Service['description']): string[] {
  const blocks = value?.root?.children
  if (!Array.isArray(blocks)) return []
  return blocks.flatMap((block) => {
    const text = collectText(block).replace(/\s+/g, ' ').trim()
    return text ? [text] : []
  })
}

function collectText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const record = node as { text?: unknown; children?: unknown[] }
  const own = typeof record.text === 'string' ? record.text : ''
  const nested = Array.isArray(record.children) ? record.children.map(collectText).join('') : ''
  return `${own}${nested}`
}
