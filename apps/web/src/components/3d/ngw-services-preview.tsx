'use client'

import dynamic from 'next/dynamic'

const NgwServicesCanvas = dynamic(
  () => import('@/components/3d/ngw-services-canvas').then((mod) => mod.NgwServicesCanvas),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-[#020305]" />,
  },
)

export function NgwServicesPreview() {
  return (
    <div className="relative h-[calc(100dvh-7.5rem)] min-h-[32rem] w-full overflow-hidden bg-[#020305]">
      <NgwServicesCanvas />
    </div>
  )
}
