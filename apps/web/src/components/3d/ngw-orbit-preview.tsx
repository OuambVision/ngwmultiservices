'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import { CategoryServiceCard } from '@/components/3d/category-service-card'
import { MobileServiceCategories } from '@/components/3d/mobile-service-categories'
import { ScrollReveal } from '@/components/site/scroll-reveal'
import type { ServiceScore } from '@/lib/reviews'

const NgwOrbitCanvas = dynamic(
  () => import('@/components/3d/ngw-orbit-canvas').then((mod) => mod.NgwOrbitCanvas),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0" />,
  },
)

export function NgwOrbitPreview({ ratings = {} }: { ratings?: Record<string, ServiceScore> }) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <>
      <MobileServiceCategories ratings={ratings} />
      <ScrollReveal className="relative mt-2 hidden h-[22rem] w-full sm:h-[26rem] lg:mt-0 lg:block lg:h-[34rem]">
        <NgwOrbitCanvas onHover={setHoveredCategory} />
        <CategoryServiceCard name={hoveredCategory} ratings={ratings} />
      </ScrollReveal>
    </>
  )
}
