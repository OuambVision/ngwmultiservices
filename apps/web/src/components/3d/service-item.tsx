'use client'

import { Text } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, Group, MeshStandardMaterial, type Euler, type Vector3 } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

import { SERVICE_PANEL } from '@/components/3d/orbit-position'

const OPEN_SMOOTHING = 3.2
const HOVER_SMOOTHING = 8
const HOVER_SCALE = 1.08
const HOVER_FORWARD = 0.46

const BODY_COLOR = new Color('#2c3342')
const TEXT_COLOR = new Color('#e7f0ff')
const TEXT_HOVER = new Color('#ffffff')

let shellGeometry: RoundedBoxGeometry | null = null
let faceGeometry: RoundedBoxGeometry | null = null

function getShellGeometry() {
  shellGeometry ??= new RoundedBoxGeometry(
    SERVICE_PANEL.width,
    SERVICE_PANEL.height,
    SERVICE_PANEL.depth,
    3,
    0.09,
  )
  return shellGeometry
}

function getFaceGeometry() {
  faceGeometry ??= new RoundedBoxGeometry(
    SERVICE_PANEL.width - 0.16,
    SERVICE_PANEL.height - 0.16,
    0.1,
    2,
    0.05,
  )
  return faceGeometry
}

type ServiceItemProps = {
  name: string
  index: number
  total: number
  position: Vector3
  rotation: Euler
  depth: number
  active: boolean
  onEnter: () => void
  onLeave: () => void
}

function isMousePointer(event: ThreeEvent<PointerEvent>) {
  return event.nativeEvent.pointerType !== 'touch'
}

export function ServiceItem({
  name,
  index,
  total,
  position,
  rotation,
  depth,
  active,
  onEnter,
  onLeave,
}: ServiceItemProps) {
  const group = useRef<Group>(null)
  const text = useRef<{ color: string; fillOpacity: number; sync: () => void }>(null)
  const bodyMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: BODY_COLOR,
        metalness: 0.62,
        roughness: 0.38,
        emissive: '#243a66',
        emissiveIntensity: 0.35,
      }),
    [],
  )
  const edgeMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#1a3f86',
        metalness: 0.72,
        roughness: 0.28,
        emissive: '#5b90ff',
        emissiveIntensity: 0.85,
      }),
    [],
  )
  const shell = useMemo(() => getShellGeometry(), [])
  const face = useMemo(() => getFaceGeometry(), [])
  const open = useRef(0)
  const emphasis = useRef(0)
  const activeRef = useRef(active)
  const hoveredRef = useRef(false)
  const colorScratch = useRef(new Color())
  const textScratch = useRef(new Color())
  const lastText = useRef('')
  const lastOpacity = useRef(-1)

  activeRef.current = active
  const faceOffset = SERVICE_PANEL.depth / 2 - 0.05

  useEffect(() => {
    return () => {
      bodyMaterial.dispose()
      edgeMaterial.dispose()
    }
  }, [bodyMaterial, edgeMaterial])

  useFrame((_, delta) => {
    const current = group.current
    if (!current) return

    const openStep = 1 - Math.exp(-OPEN_SMOOTHING * delta)
    const hoverStep = 1 - Math.exp(-HOVER_SMOOTHING * delta)
    open.current += ((activeRef.current ? 1 : 0) - open.current) * openStep
    emphasis.current += ((hoveredRef.current ? 1 : 0) - emphasis.current) * hoverStep

    const stagger = (index / Math.max(total, 1)) * 0.34
    const span = Math.max(0.45, 1 - stagger)
    const revealed = Math.min(1, Math.max(0, (open.current - stagger) / span))
    const eased = revealed * revealed * (3 - 2 * revealed)
    const near = (depth + 1) / 2
    const presence = 0.38 + near * 0.62
    const scale = Math.max(eased * (1 + (HOVER_SCALE - 1) * emphasis.current), 0.0001)

    current.position.set(
      position.x * eased,
      position.y * eased,
      position.z * eased + emphasis.current * HOVER_FORWARD,
    )
    current.rotation.set(rotation.x * eased, rotation.y * eased, rotation.z * eased)
    current.scale.setScalar(scale)

    const opacity = eased
    const transparent = opacity < 0.985
    for (const material of [bodyMaterial, edgeMaterial]) {
      material.opacity = opacity
      material.transparent = transparent
      material.depthWrite = true
    }

    bodyMaterial.color.copy(BODY_COLOR).multiplyScalar(0.5 + presence * 0.5)
    bodyMaterial.emissiveIntensity = 0.06 + presence * 0.38 + emphasis.current * 0.35
    edgeMaterial.emissiveIntensity = 0.18 + presence * 1.05 + emphasis.current * 1.15

    const label = text.current
    if (!label) return
    textScratch.current.copy(TEXT_COLOR).lerp(TEXT_HOVER, Math.min(1, near * 0.35 + emphasis.current))
    colorScratch.current.copy(textScratch.current).multiplyScalar(0.82 + presence * 0.18)
    const nextColor = `#${colorScratch.current.getHexString()}`
    if (nextColor !== lastText.current || Math.abs(opacity - lastOpacity.current) > 0.02) {
      lastText.current = nextColor
      lastOpacity.current = opacity
      label.color = nextColor
      label.fillOpacity = opacity
      label.sync()
    }
  })

  return (
    <group
      ref={group}
      name={`service:${name}`}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        if (!isMousePointer(event)) return
        event.stopPropagation()
        hoveredRef.current = true
        onEnter()
      }}
      onPointerOut={(event: ThreeEvent<PointerEvent>) => {
        if (!isMousePointer(event)) return
        event.stopPropagation()
        hoveredRef.current = false
        onLeave()
      }}
    >
      <mesh geometry={shell} material={edgeMaterial} />
      <mesh geometry={face} material={bodyMaterial} position={[0, 0, faceOffset]} raycast={() => null} />
      <mesh geometry={face} material={bodyMaterial} position={[0, 0, -faceOffset]} raycast={() => null} />
      <Text
        ref={text}
        position={[0, 0, SERVICE_PANEL.depth / 2 + 0.02]}
        fontSize={0.24}
        maxWidth={1.82}
        lineHeight={1.05}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#f4f8ff"
        raycast={() => null}
      >
        {name}
      </Text>
    </group>
  )
}
