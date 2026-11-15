import type { Metadata } from 'next'

import { NgwOrbitPreview } from '@/components/3d/ngw-orbit-preview'
import { site } from '@/config/site'
import { buildOrbitCategoryCards } from '@/data/ngw-service-catalog'
import { loadHome } from '@/lib/home'
import { loadReviewCards, scoresByService } from '@/lib/reviews'

export const metadata: Metadata = {
  title: { absolute: `Automotive 3D orbit — ${site.name}` },
}

export default async function AutomotiveOrbitPage() {
  const [content, reviewCards] = await Promise.all([loadHome(), loadReviewCards()])
  const cards = buildOrbitCategoryCards(content.categories)
  const ratings = scoresByService(reviewCards).bySlug

  return <NgwOrbitPreview cards={cards} ratings={ratings} />
}
