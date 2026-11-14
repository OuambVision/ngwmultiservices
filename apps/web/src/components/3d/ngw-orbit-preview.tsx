'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import { CategoryServiceCard } from '@/components/3d/category-service-card'
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
    <div className="relative h-[22rem] w-full sm:h-[26rem] lg:h-[34rem]">
      <NgwOrbitCanvas onHover={setHoveredCategory} />
      <CategoryServiceCard name={hoveredCategory} ratings={ratings} />
    </div>
  )
}
