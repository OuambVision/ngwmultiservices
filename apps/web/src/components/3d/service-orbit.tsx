'use client'

import { Line } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Group, PerspectiveCamera, Vector3, type Object3D } from 'three'

import {
  SHOW_ORBIT_GUIDE,
  get3DOrbitPoint,
  get3DOrbitPosition,
  getOrbitRadii,
  type OrbitRadii,
} from '@/components/3d/orbit-position'
import { ServiceItem } from '@/components/3d/service-item'

type ServiceOrbitProps = {
  object: Object3D
  services: readonly string[]
  active: boolean
  onEnter: () => void
  onLeave: () => void
}

const FALLBACK_RADII: OrbitRadii = { radiusX: 7.1, radiusY: 3.6, radiusZ: 10.5 }

function OrbitGuide({ radiusX, radiusY, radiusZ }: OrbitRadii) {
  const points = useMemo(() => {
    const steps = 96
    const curve = Array.from({ length: steps }, (_, step) => {
      const theta = (step / steps) * Math.PI * 2
      const point = get3DOrbitPoint(theta, radiusX, radiusY, radiusZ)
      return new Vector3(point.x, point.y, point.z)
    })
    curve.push(curve[0].clone())
    return curve
  }, [radiusX, radiusY, radiusZ])

  return (
    <Line
      points={points}
      color="#6ea2ff"
      transparent
      opacity={0.28}
      depthWrite={false}
      raycast={() => null}
    />
  )
}

export function ServiceOrbit({ object, services, active, onEnter, onLeave }: ServiceOrbitProps) {
  const anchor = useRef<Group>(null)
  const orbitGroupRef = useRef<Group>(null)
  const camera = useThree((state) => state.camera)
  const viewportHeight = useThree((state) => state.size.height)
  const [mounted, setMounted] = useState(active)
  const activeRef = useRef(active)
  const open = useRef(0)
  const closing = useRef(false)

  activeRef.current = active

  useEffect(() => {
    if (active) {
      closing.current = false
      setMounted(true)
    }
  }, [active])

  const radii = useMemo(() => {
    const perspective = camera instanceof PerspectiveCamera ? camera : null
    return perspective
      ? getOrbitRadii(object, perspective, viewportHeight, services.length)
      : FALLBACK_RADII
  }, [camera, object, services.length, viewportHeight])

  const placements = useMemo(
    () =>
      services.map((_, index) =>
        get3DOrbitPosition(index, services.length, radii.radiusX, radii.radiusY, radii.radiusZ),
      ),
    [radii, services],
  )

  useFrame((_, delta) => {
    const current = anchor.current
    if (!current) return

    object.getWorldPosition(current.position)
    current.quaternion.copy(camera.quaternion)

    const step = 1 - Math.exp(-3.4 * delta)
    open.current += ((activeRef.current ? 1 : 0) - open.current) * step

    if (!activeRef.current && open.current < 0.03 && !closing.current) {
      closing.current = true
      setMounted(false)
    }
  })

  if (!mounted || services.length === 0) return null

  return (
    <group ref={anchor}>
      <group ref={orbitGroupRef}>
        {SHOW_ORBIT_GUIDE ? <OrbitGuide {...radii} /> : null}
        {services.map((service, index) => {
          const placement = placements[index]
          return (
            <ServiceItem
              key={service}
              name={service}
              index={index}
              total={services.length}
              position={placement.position}
              rotation={placement.rotation}
              depth={placement.depth}
              active={active}
              onEnter={onEnter}
              onLeave={onLeave}
            />
          )
        })}
      </group>
    </group>
  )
}
