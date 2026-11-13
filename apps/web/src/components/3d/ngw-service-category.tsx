'use client'

import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, Mesh, MeshStandardMaterial, type Object3D } from 'three'

import { ServiceOrbit } from '@/components/3d/service-orbit'

const HOVER_SCALE = 1.05
const DIM_OPACITY = 0.92
const BRIGHTNESS = 0.045
const SMOOTHING = 5
const HOVER_GLOW = new Color(0.012, 0.03, 0.07)

type MaterialSnapshot = {
  material: MeshStandardMaterial
  color: Color
  emissive: Color
  emissiveIntensity: number
  opacity: number
  transparent: boolean
}

type NGWServiceCategoryProps = {
  object: Object3D
  name: string
  services: readonly string[]
  active: boolean
  dimmed: boolean
  onEnter: (name: string) => void
  onLeave: (name: string) => void
}

function snapshotMaterials(object: Object3D) {
  const seen = new Set<MeshStandardMaterial>()
  const snapshots: MaterialSnapshot[] = []

  object.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh) return

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const source of materials) {
      const material = source as MeshStandardMaterial
      if (!material?.color || !material.emissive || seen.has(material)) continue
      seen.add(material)
      snapshots.push({
        material,
        color: material.color.clone(),
        emissive: material.emissive.clone(),
        emissiveIntensity: material.emissiveIntensity ?? 0,
        opacity: material.opacity,
        transparent: material.transparent,
      })
    }
  })

  return snapshots
}

function isMousePointer(event: ThreeEvent<PointerEvent>) {
  return event.nativeEvent.pointerType !== 'touch'
}

export function NGWServiceCategory({
  object,
  name,
  services,
  active,
  dimmed,
  onEnter,
  onLeave,
}: NGWServiceCategoryProps) {
  const baseScale = useMemo(() => object.scale.clone(), [object])
  const materials = useMemo(() => snapshotMaterials(object), [object])
  const emphasis = useRef(0)
  const fade = useRef(0)
  const activeRef = useRef(active)
  const dimmedRef = useRef(dimmed)
  const colorScratch = useRef(new Color())
  const emissiveScratch = useRef(new Color())

  activeRef.current = active
  dimmedRef.current = dimmed

  useLayoutEffect(() => {
    return () => {
      object.scale.copy(baseScale)
      for (const snapshot of materials) {
        snapshot.material.color.copy(snapshot.color)
        snapshot.material.emissive.copy(snapshot.emissive)
        snapshot.material.emissiveIntensity = snapshot.emissiveIntensity
        snapshot.material.opacity = snapshot.opacity
        snapshot.material.transparent = snapshot.transparent
      }
    }
  }, [baseScale, materials, object])

  useFrame((_, delta) => {
    const step = 1 - Math.exp(-SMOOTHING * delta)
    emphasis.current += ((activeRef.current ? 1 : 0) - emphasis.current) * step
    fade.current += ((dimmedRef.current ? 1 : 0) - fade.current) * step

    const factor = 1 + (HOVER_SCALE - 1) * emphasis.current
    object.scale.set(baseScale.x * factor, baseScale.y * factor, baseScale.z * factor)

    const opacity = 1 - (1 - DIM_OPACITY) * fade.current
    for (const snapshot of materials) {
      const material = snapshot.material
      colorScratch.current.copy(snapshot.color).multiplyScalar(1 + BRIGHTNESS * emphasis.current)
      material.color.copy(colorScratch.current)
      emissiveScratch.current.copy(HOVER_GLOW).multiplyScalar(emphasis.current).add(snapshot.emissive)
      material.emissive.copy(emissiveScratch.current)
      material.emissiveIntensity = snapshot.emissiveIntensity
      material.opacity = opacity
      const transparent = opacity < 0.999 || snapshot.transparent
      if (material.transparent !== transparent) {
        material.transparent = transparent
        material.needsUpdate = true
      }
    }
  })

  return (
    <>
      <primitive
        object={object}
        onPointerOver={(event: ThreeEvent<PointerEvent>) => {
          if (!isMousePointer(event)) return
          event.stopPropagation()
          onEnter(name)
        }}
        onPointerOut={(event: ThreeEvent<PointerEvent>) => {
          if (!isMousePointer(event)) return
          event.stopPropagation()
          onLeave(name)
        }}
      />
      <ServiceOrbit
        object={object}
        services={services}
        active={active}
        onEnter={() => onEnter(name)}
        onLeave={() => onLeave(name)}
      />
    </>
  )
}
