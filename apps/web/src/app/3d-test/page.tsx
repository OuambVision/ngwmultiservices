import type { Metadata } from 'next'

import { NgwServicesPreview } from '@/components/3d/ngw-services-preview'
import { site } from '@/config/site'

export const metadata: Metadata = {
  title: { absolute: `3D test — ${site.name}` },
}

export default function ThreeDTestPage() {
  return <NgwServicesPreview />
}
