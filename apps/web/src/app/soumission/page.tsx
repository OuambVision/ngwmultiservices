import type { Metadata } from 'next'

import { QuoteForm } from '@/components/site/quote-form'
import { getT } from '@/i18n/server'
import { loadCategories } from '@/lib/catalog'

type PageProps = {
  searchParams: Promise<{ categorie?: string | string[] }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('quote.metaTitle') }
}

export default async function QuotePage({ searchParams }: PageProps) {
  const query = (await searchParams).categorie
  const slug = Array.isArray(query) ? query[0] : query
  const categories = (await loadCategories()).flatMap((category) =>
    category.slug && category.title ? [{ id: category.id, slug: category.slug, title: category.title }] : [],
  )
  const initial = categories.find((category) => category.slug === slug)

  return <QuoteForm categories={categories} initialCategory={initial?.id} />
}
