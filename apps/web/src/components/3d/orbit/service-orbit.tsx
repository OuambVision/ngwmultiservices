'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, type MutableRefObject } from 'react'
import { Quaternion, Vector3 } from 'three'

import { paintServiceMaterial } from '@/components/3d/orbit/orbit-materials'
import type { CategoryRuntime, OrbitInput } from '@/components/3d/orbit/types'

const EMERGE_START = 0.56
const HOVER_SCALE = 1.04
const HOVER_SMOOTHING = 8
const INERTIA_DAMPING = 5
const VELOCITY_STOP = 0.02

const localUp = new Vector3(0, 1, 0)

type ServiceOrbitProps = {
  runtimeRef: MutableRefObject<CategoryRuntime | null>
  inputRef: MutableRefObject<OrbitInput>
}

export function ServiceOrbit({ runtimeRef, inputRef }: ServiceOrbitProps) {
  const spinQuaternionRef = useRef(new Quaternion())

  useFrame((_, delta) => {
    const runtime = runtimeRef.current
    if (!runtime) return

    const draggingThis = inputRef.current.dragging && inputRef.current.dragTarget === runtime
    if (!draggingThis && runtime.velocity !== 0) {
      runtime.spin += runtime.velocity * delta
      runtime.velocity *= Math.exp(-INERTIA_DAMPING * delta)
      if (Math.abs(runtime.velocity) < VELOCITY_STOP) runtime.velocity = 0
    }

    spinQuaternionRef.current.setFromAxisAngle(localUp, runtime.spin)
    runtime.orbit.quaternion.copy(runtime.alignment).multiply(spinQuaternionRef.current)

    const presence = runtime.presence
    const emerge = EMERGE_START + (1 - EMERGE_START) * presence
    const hoverStep = 1 - Math.exp(-HOVER_SMOOTHING * delta)
    if (runtime.guide) {
      const fit = runtime.guideFit * emerge
      runtime.guide.visible = presence > 0.02
      runtime.guide.scale.set(fit, fit, fit)
      for (const snapshot of runtime.guideMaterials) {
        paintServiceMaterial(snapshot, 0, presence)
      }
    }
    for (const service of runtime.services) {
      const target = service === runtime.hovered ? 1 : 0
      service.emphasis += (target - service.emphasis) * hoverStep
      const factor = presence * (1 + (HOVER_SCALE - 1) * service.emphasis)
      service.object.visible = presence > 0.02
      service.object.position.copy(service.restPosition).multiplyScalar(emerge)
      service.object.scale.set(
        service.baseScale.x * factor,
        service.baseScale.y * factor,
        service.baseScale.z * factor,
      )
      for (const snapshot of service.materials) {
        paintServiceMaterial(snapshot, service.emphasis, presence)
      }
    }
  })

  return null
}
