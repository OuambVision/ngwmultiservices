import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CategoryCatalog } from '@/components/site/category-catalog'
import { getLocale, getT } from '@/i18n/server'
import { loadCategories, loadCategory, loadCategoryServices } from '@/lib/catalog'
import { loadReviewCards, scoresByService } from '@/lib/reviews'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await loadCategory((await params).slug)
  return { title: category?.title ?? 'Services' }
}

export default async function CategoryPage({ params }: PageProps) {
  const slug = (await params).slug
  const t = await getT()
  const locale = await getLocale()
  const [category, categories] = await Promise.all([loadCategory(slug), loadCategories()])
  if (!category) notFound()
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
