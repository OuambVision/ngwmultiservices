import type { Metadata } from 'next'

import { NgwOrbitPreview } from '@/components/3d/ngw-orbit-preview'
import { site } from '@/config/site'

export const metadata: Metadata = {
  title: { absolute: `Automotive 3D orbit — ${site.name}` },
}

export default function AutomotiveOrbitPage() {
  return <NgwOrbitPreview />
}
