'use client'

import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef, type MutableRefObject } from 'react'
import { Box3, Color, Mesh, Quaternion, Vector3, type Material, type Object3D } from 'three'

import { ORBIT_ZONE_PADDING } from '@/components/3d/orbit/category-orbit-config'
import { circlePosition, horizontalAlignment } from '@/components/3d/orbit/circle'
import {
  isolateMaterials,
  paintCategoryMaterial,
  restoreMaterials,
  restoreSnapshot,
  snapshotMaterials,
} from '@/components/3d/orbit/orbit-materials'
import { ServiceOrbit } from '@/components/3d/orbit/service-orbit'
import type {
  CategoryOrbitConfig,
  CategoryRuntime,
  OrbitInput,
  ServiceBinding,
} from '@/components/3d/orbit/types'

const PRESENCE_SMOOTHING = 4.2
const CATEGORY_SCALE = 1.04
const EMERGE_START = 0.56
const guideAxis = new Vector3(1, 0, 0)
const labelColor = new Color('#071b4b')

function paintCaption(category: Object3D) {
  category.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh || !mesh.name.endsWith('_Label')) return
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) {
      if (!('color' in material)) continue
      const lit = material as Material & {
        color: Color
        emissive?: Color
        emissiveIntensity?: number
      }
      lit.color.copy(labelColor)
      lit.emissive?.set(0, 0, 0)
      if (lit.emissiveIntensity !== undefined) lit.emissiveIntensity = 0
    }
  })
}

function authoredGuideRadius(guide: Object3D) {
  const box = new Box3()
  let found = false
  guide.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh) return
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
    if (!mesh.geometry.boundingBox) return
    box.union(mesh.geometry.boundingBox)
    found = true
  })
  if (!found || box.isEmpty()) return 1
  const radial = Math.max(
    Math.abs(box.min.x),
    Math.abs(box.max.x),
    Math.abs(box.min.y),
    Math.abs(box.max.y),
  )
  const thickness = (box.max.z - box.min.z) / 2
  return Math.max(radial - thickness, 0.001)
}

type CategoryOrbitProps = {
  config: CategoryOrbitConfig
  scene: Object3D
  registry: MutableRefObject<CategoryRuntime[]>
  inputRef: MutableRefObject<OrbitInput>
}

function bindCategory(scene: Object3D, config: CategoryOrbitConfig) {
  scene.updateMatrixWorld(true)
  const category = scene.getObjectByName(config.categoryObject)
  const orbit = scene.getObjectByName(config.orbitObject)
  if (!category || !orbit) return null

  const found = config.services.flatMap((serviceConfig, index) => {
    const object = scene.getObjectByName(serviceConfig.objectName)
    if (!object) return []
    return [{ serviceConfig, object, index }]
  })
  if (found.length === 0) return null

  isolateMaterials(category)
  paintCaption(category)
  const alignment = horizontalAlignment()
  const services: ServiceBinding[] = found.map(({ serviceConfig, object, index }) => {
    isolateMaterials(object)
    const worldQuaternion = object.getWorldQuaternion(new Quaternion())
    const restPosition = circlePosition(index, config.services.length, config.radius, new Vector3())
    const binding: ServiceBinding = {
      label: serviceConfig.label,
      object,
      baseScale: object.scale.clone(),
      restPosition,
      originalPosition: object.position.clone(),
      originalQuaternion: object.quaternion.clone(),
      emphasis: 0,
      materials: snapshotMaterials(object),
    }
    object.position.copy(restPosition).multiplyScalar(EMERGE_START)
    object.quaternion.copy(alignment).invert().multiply(worldQuaternion)
    object.scale.set(0, 0, 0)
    for (const snapshot of binding.materials) {
      snapshot.material.opacity = 0
      snapshot.material.transparent = true
      snapshot.material.depthWrite = false
    }
    return binding
  })

  const guide = config.guideObject ? (scene.getObjectByName(config.guideObject) ?? null) : null
  const guideWasVisible = guide?.visible ?? false
  const originalGuideQuaternion = guide?.quaternion.clone() ?? new Quaternion()
  const originalGuideScale = guide?.scale.clone() ?? new Vector3(1, 1, 1)
  let guideFit = 1
  let guideMaterials: CategoryRuntime['guideMaterials'] = []
  if (guide) {
    isolateMaterials(guide)
    guideMaterials = snapshotMaterials(guide)
    guideFit = config.radius / authoredGuideRadius(guide)
    guide.visible = true
    guide.quaternion.setFromAxisAngle(guideAxis, Math.PI / 2)
    const hidden = guideFit * EMERGE_START
    guide.scale.set(hidden, hidden, hidden)
    for (const snapshot of guideMaterials) {
      snapshot.material.opacity = 0
      snapshot.material.transparent = true
      snapshot.material.depthWrite = false
    }
  }

  const originalOrbitQuaternion = orbit.quaternion.clone()
  orbit.quaternion.copy(alignment)

  return {
    config,
    category,
    categoryBaseScale: category.scale.clone(),
    categoryMaterials: snapshotMaterials(category),
    orbit,
    originalOrbitQuaternion,
    alignment,
    services,
    guide,
    guideWasVisible,
    guideFit,
    guideMaterials,
    originalGuideQuaternion,
    originalGuideScale,
    zoneRadius: config.radius + ORBIT_ZONE_PADDING,
    spin: 0,
    velocity: 0,
    engaged: false,
    releaseAt: 0,
    presence: 0,
    hovered: null,
  } satisfies CategoryRuntime
}

function restoreCategory(runtime: CategoryRuntime) {
  runtime.orbit.quaternion.copy(runtime.originalOrbitQuaternion)
  if (runtime.guide) {
    runtime.guide.visible = runtime.guideWasVisible
    runtime.guide.quaternion.copy(runtime.originalGuideQuaternion)
    runtime.guide.scale.copy(runtime.originalGuideScale)
    for (const snapshot of runtime.guideMaterials) restoreSnapshot(snapshot)
    restoreMaterials(runtime.guide)
  }
  for (const service of runtime.services) {
    service.object.visible = true
    service.object.position.copy(service.originalPosition)
    service.object.quaternion.copy(service.originalQuaternion)
    service.object.scale.copy(service.baseScale)
    for (const snapshot of service.materials) restoreSnapshot(snapshot)
    restoreMaterials(service.object)
  }
  runtime.category.scale.copy(runtime.categoryBaseScale)
  for (const snapshot of runtime.categoryMaterials) restoreSnapshot(snapshot)
  restoreMaterials(runtime.category)
}

export function CategoryOrbit({ config, scene, registry, inputRef }: CategoryOrbitProps) {
  const runtimeRef = useRef<CategoryRuntime | null>(null)

  useLayoutEffect(() => {
    const runtime = bindCategory(scene, config)
    runtimeRef.current = runtime
    if (!runtime) return
    registry.current.push(runtime)
    return () => {
      restoreCategory(runtime)
      registry.current = registry.current.filter((item) => item !== runtime)
      runtimeRef.current = null
    }
  }, [config, registry, scene])

  useFrame((_, delta) => {
    const runtime = runtimeRef.current
    if (!runtime) return

    const draggingThis = inputRef.current.dragging && inputRef.current.dragTarget === runtime
    if (runtime.releaseAt !== 0 && performance.now() >= runtime.releaseAt && !draggingThis) {
      runtime.engaged = false
      runtime.releaseAt = 0
      runtime.hovered = null
    }

    const step = 1 - Math.exp(-PRESENCE_SMOOTHING * delta)
    runtime.presence += ((runtime.engaged ? 1 : 0) - runtime.presence) * step

    const factor = 1 + (CATEGORY_SCALE - 1) * runtime.presence
    runtime.category.scale.set(
      runtime.categoryBaseScale.x * factor,
      runtime.categoryBaseScale.y * factor,
      runtime.categoryBaseScale.z * factor,
    )
    for (const snapshot of runtime.categoryMaterials) {
      paintCategoryMaterial(snapshot, runtime.presence)
    }
  })

  return <ServiceOrbit runtimeRef={runtimeRef} inputRef={inputRef} />
}
