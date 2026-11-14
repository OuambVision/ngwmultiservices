import type { Metadata } from 'next'

import { CategoryCatalog } from '@/components/site/category-catalog'
import { getLocale, getT } from '@/i18n/server'
import { loadCategories, loadCategoryServices } from '@/lib/catalog'
import { loadReviewCards, scoresByService } from '@/lib/reviews'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const categories = await loadCategories()
  const category = categories.find((item) => item.slug === 'automobile') ?? categories[0]
  return { title: category?.title ?? t('services.metaTitle') }
}

export default async function ServicesPage() {
  const t = await getT()
  const locale = await getLocale()
  const categories = await loadCategories()
  const category = categories.find((item) => item.slug === 'automobile') ?? categories[0]

  if (!category) {
    return (
      <section className="mx-auto w-full max-w-[90rem] px-4 py-16 sm:px-6">
        <p className="rounded-2xl bg-white px-6 py-10 text-navy/70 ring-1 ring-navy/10">{t('services.empty')}</p>
      </section>
    )
  }

  const [services, reviews] = await Promise.all([loadCategoryServices(category.id), loadReviewCards()])

  return (
    <CategoryCatalog
      categories={categories}
      category={category}
      locale={locale}
      ratings={scoresByService(reviews).byId}
      services={services}
      t={t}
    />
  )
}
