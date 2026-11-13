import { NGW_CATEGORY_SERVICES } from '@/data/ngw-service-catalog'

import type { CategoryOrbitConfig, OrbitServiceConfig } from '@/components/3d/orbit/types'

const ORBIT_RADIUS = 7.5
const ZONE_PADDING = 3.5

function serviceObjects(categoryObject: string, labels: readonly string[]): OrbitServiceConfig[] {
  return labels.map((label, index) => ({
    objectName: `${categoryObject}_Service_${String(index + 1).padStart(2, '0')}`,
    label,
  }))
}

export const ORBIT_ZONE_PADDING = ZONE_PADDING

export const categoryOrbitConfigs: readonly CategoryOrbitConfig[] = [
  {
    id: 'automotive',
    categoryObject: 'NGW_Automotive',
    orbitObject: 'NGW_Automotive_Orbit',
    guideObject: 'NGW_Automotive_OrbitGuide',
    radius: ORBIT_RADIUS,
    services: serviceObjects('NGW_Automotive', NGW_CATEGORY_SERVICES.NGW_Automotive),
  },
  {
    id: 'commercial',
    categoryObject: 'NGW_Commercial',
    orbitObject: 'NGW_Commercial_Orbit',
    guideObject: 'NGW_Commercial_OrbitGuide',
    radius: ORBIT_RADIUS,
    services: serviceObjects('NGW_Commercial', NGW_CATEGORY_SERVICES.NGW_Commercial),
  },
  {
    id: 'residential',
    categoryObject: 'NGW_Residential',
    orbitObject: 'NGW_Residential_Orbit',
    guideObject: 'NGW_Residential_OrbitGuide',
    radius: ORBIT_RADIUS,
    services: serviceObjects('NGW_Residential', NGW_CATEGORY_SERVICES.NGW_Residential),
  },
  {
    id: 'specialized',
    categoryObject: 'NGW_Specialized',
    orbitObject: 'NGW_Specialized_Orbit',
    guideObject: 'NGW_Specialized_OrbitGuide',
    radius: ORBIT_RADIUS,
    services: serviceObjects('NGW_Specialized', NGW_CATEGORY_SERVICES.NGW_Specialized),
  },
]
