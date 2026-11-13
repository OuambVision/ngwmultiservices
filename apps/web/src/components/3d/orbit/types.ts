import type { Color, MeshStandardMaterial, Object3D, Quaternion, Vector3 } from 'three'

export type OrbitServiceConfig = {
  objectName: string
  label: string
}

export type CategoryOrbitConfig = {
  id: 'automotive' | 'commercial' | 'residential' | 'specialized'
  categoryObject: string
  orbitObject: string
  guideObject?: string
  radius: number
  services: readonly OrbitServiceConfig[]
}

export type PartRole = 'body' | 'edge' | 'text' | 'other'

export type HoverMaterial = {
  material: MeshStandardMaterial
  color: Color
  emissive: Color
  emissiveIntensity: number
  opacity: number
  transparent: boolean
  depthWrite: boolean
  role: PartRole
}

export type ServiceBinding = {
  label: string
  object: Object3D
  baseScale: Vector3
  restPosition: Vector3
  originalPosition: Vector3
  originalQuaternion: Quaternion
  emphasis: number
  materials: HoverMaterial[]
}

export type CategoryRuntime = {
  config: CategoryOrbitConfig
  category: Object3D
  categoryBaseScale: Vector3
  categoryMaterials: HoverMaterial[]
  orbit: Object3D
  originalOrbitQuaternion: Quaternion
  alignment: Quaternion
  services: ServiceBinding[]
  guide: Object3D | null
  guideWasVisible: boolean
  guideFit: number
  guideMaterials: HoverMaterial[]
  originalGuideQuaternion: Quaternion
  originalGuideScale: Vector3
  zoneRadius: number
  spin: number
  velocity: number
  engaged: boolean
  releaseAt: number
  presence: number
  hovered: ServiceBinding | null
}

export type OrbitInput = {
  dragging: boolean
  dragTarget: CategoryRuntime | null
}
