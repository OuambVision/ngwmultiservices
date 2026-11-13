import { API_URL } from '@repo/api'
import type { Category, Service, SiteSetting } from '@repo/types'

import { site } from '@/config/site'
import { withLocale } from '@/i18n/locale'
import { getLocale, getT } from '@/i18n/server'

type ListResponse<T> = {
  docs: T[]
}

export type HomeCategory = Category & {
  services: Service[]
}

export type HomeContent = {
  area: string
  categories: HomeCategory[]
  heroImages: string[]
  intro: string
  title: string
}

async function readJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, { cache: 'no-store' })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

function heroImageUrls(settings: SiteSetting | null): string[] {
  const rows = settings?.heroImages
  if (!Array.isArray(rows)) return []
  return rows.flatMap((row) => {
    const url = row && typeof row === 'object' && 'url' in row ? row.url : null
    return typeof url === 'string' && url.trim() ? [url.trim()] : []
  })
}

function categoryId(service: Service): number | null {
  if (typeof service.category === 'number') return service.category
  return service.category?.id ?? null
}

export async function loadHome(): Promise<HomeContent> {
  const locale = await getLocale()
  const t = await getT()
  const [categories, services, settings] = await Promise.all([
    readJson<ListResponse<Category>>(withLocale('/categories?limit=20&sort=order&depth=0', locale)),
    readJson<ListResponse<Service>>(withLocale('/services?limit=100&sort=order&depth=0', locale)),
    readJson<SiteSetting>(withLocale('/globals/siteSettings', locale)),
  ])

  const area = settings?.area?.trim() || site.area
  const servicesByCategory = new Map<number, Service[]>()
  for (const service of services?.docs ?? []) {
    const id = categoryId(service)
    if (id == null) continue
    const list = servicesByCategory.get(id) ?? []
    list.push(service)
    servicesByCategory.set(id, list)
  }

  return {
    area,
    categories: (categories?.docs ?? []).map((category) => ({
      ...category,
      services: servicesByCategory.get(category.id) ?? [],
    })),
    heroImages: heroImageUrls(settings),
    intro: settings?.homeIntro?.trim() || t('home.introFallback', { area }),
    title: settings?.homeTitle?.trim() || t('home.titleFallback'),
  }
}
