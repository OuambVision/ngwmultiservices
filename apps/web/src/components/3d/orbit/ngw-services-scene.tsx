'use client'

import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRouter } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { PerspectiveCamera, Quaternion, Vector2, Vector3, type Object3D } from 'three'

import { createCategoryRing, type CategoryRing } from '@/components/3d/orbit/category-ring'
import { categoryPageHref } from '@/data/ngw-service-catalog'

const MODEL_PATH = '/3d/ngw-services-orbit.glb'
const IDLE_SPIN = 0.07

function orbitFit(width: number) {
  return width >= 1024 ? 0.86 : 0.8
}
const RADIANS_PER_PIXEL = 0.006
const WHEEL_VELOCITY_PER_PIXEL = 0.015
const MAX_VELOCITY = 2.2
const HOLD_STILL_MS = 70
const CLICK_DISTANCE = 8
const VELOCITY_DAMPING = 5

const pointerNdc = new Vector2()
const worldPosition = new Vector3()
const savedWorldQuaternion = new Quaternion()

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function wheelPixels(event: WheelEvent, element: HTMLElement) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * element.clientHeight
  return event.deltaY
}

export function NGWServicesScene({ onHover }: { onHover?: (name: string | null) => void }) {
  const gltf = useGLTF(MODEL_PATH)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const gl = useThree((state) => state.gl)
  const raycaster = useThree((state) => state.raycaster)
  const posed = useRef(false)
  const ringRef = useRef<CategoryRing | null>(null)
  const basePosition = useRef(new Vector3())
  const baseQuaternion = useRef(new Quaternion())
  const dragging = useRef(false)
  const pointerId = useRef<number | null>(null)
  const lastX = useRef(0)
  const lastMoveTime = useRef(0)
  const velocity = useRef(0)
  const onHoverRef = useRef(onHover)
  const hoveredName = useRef<string | null>(null)
  const pressX = useRef(0)
  const pressY = useRef(0)
  const pressCategory = useRef<string | null>(null)
  const router = useRouter()
  onHoverRef.current = onHover

  const reportHover = (object: Object3D | null) => {
    const name = object?.name ?? null
    ringRef.current?.hover(object)
    if (name === hoveredName.current) return
    hoveredName.current = name
    onHoverRef.current?.(name)
  }

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    camera.aspect = size.width / Math.max(size.height, 1)
    if (!posed.current) {
      const source = gltf.cameras[0]
      if (source instanceof PerspectiveCamera) {
        gltf.scene.updateMatrixWorld(true)
        source.getWorldPosition(worldPosition)
        source.getWorldQuaternion(savedWorldQuaternion)
        camera.position.copy(worldPosition)
        camera.quaternion.copy(savedWorldQuaternion)
        camera.up.set(0, 1, 0).applyQuaternion(camera.quaternion)
        camera.fov = source.fov
        camera.near = source.near
        camera.far = source.far
      }
      basePosition.current.copy(camera.position)
      baseQuaternion.current.copy(camera.quaternion)
      posed.current = true
    }
    camera.updateProjectionMatrix()
  }, [camera, gltf, size.height, size.width])

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    const ring = createCategoryRing(gltf.scene)
    ring.update(0)
    ring.frame(camera, basePosition.current, baseQuaternion.current, orbitFit(size.width))
    ringRef.current = ring
    return () => {
      ring.restore()
      ringRef.current = null
      camera.position.copy(basePosition.current)
      camera.quaternion.copy(baseQuaternion.current)
      camera.updateProjectionMatrix()
    }
  }, [camera, gltf])

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    ringRef.current?.frame(camera, basePosition.current, baseQuaternion.current, orbitFit(size.width))
  }, [camera, size.height, size.width])

  useEffect(() => {
    const element = gl.domElement
    element.style.touchAction = 'pan-y'

    const aimRay = (event: { clientX: number; clientY: number }) => {
      const rect = element.getBoundingClientRect()
      pointerNdc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(pointerNdc, camera)
    }

    const insideRing = () => ringRef.current?.inside(raycaster) ?? false

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      if (dragging.current) return
      aimRay(event)
      if (!insideRing()) return
      pressX.current = event.clientX
      pressY.current = event.clientY
      pressCategory.current = ringRef.current?.categoryAt(raycaster)?.name ?? null
      dragging.current = true
      pointerId.current = event.pointerId
      lastX.current = event.clientX
      lastMoveTime.current = performance.now()
      velocity.current = 0
      element.style.cursor = 'grabbing'
      element.style.touchAction = 'none'
      element.setPointerCapture(event.pointerId)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging.current || event.pointerId !== pointerId.current) {
        aimRay(event)
        const inside = insideRing()
        const category = ringRef.current?.categoryAt(raycaster) ?? null
        reportHover(category)
        element.style.touchAction = inside ? 'none' : 'pan-y'
        element.style.cursor = category ? 'pointer' : inside ? 'grab' : 'auto'
        return
      }
      const now = performance.now()
      const deltaX = event.clientX - lastX.current
      const deltaTime = (now - lastMoveTime.current) / 1000
      const deltaSpin = deltaX * RADIANS_PER_PIXEL
      ringRef.current?.add(deltaSpin)
      if (deltaTime > 0 && deltaTime < 0.08) {
        velocity.current = clamp(deltaSpin / deltaTime, -MAX_VELOCITY, MAX_VELOCITY)
      }
      lastX.current = event.clientX
      lastMoveTime.current = now
    }

    const finishDrag = (event: PointerEvent, navigate: boolean) => {
      if (!dragging.current || event.pointerId !== pointerId.current) return
      if (performance.now() - lastMoveTime.current > HOLD_STILL_MS) velocity.current = 0
      dragging.current = false
      pointerId.current = null
      element.style.touchAction = 'pan-y'
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
      aimRay(event)
      const category = ringRef.current?.categoryAt(raycaster) ?? null
      const moved = Math.hypot(event.clientX - pressX.current, event.clientY - pressY.current)
      const href = pressCategory.current ? categoryPageHref(pressCategory.current) : null
      element.style.cursor = category ? 'pointer' : insideRing() ? 'grab' : 'auto'
      element.style.touchAction = insideRing() ? 'none' : 'pan-y'
      if (navigate && moved < CLICK_DISTANCE && href) router.push(href)
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return
      aimRay(event)
      if (!insideRing() || dragging.current) return
      event.preventDefault()
      const impulse = wheelPixels(event, element) * WHEEL_VELOCITY_PER_PIXEL
      velocity.current = clamp(velocity.current + impulse, -MAX_VELOCITY, MAX_VELOCITY)
    }

    const onPointerLeave = () => {
      if (dragging.current) return
      reportHover(null)
      element.style.cursor = 'auto'
      element.style.touchAction = 'pan-y'
    }

    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointerleave', onPointerLeave)
    element.addEventListener('pointermove', onPointerMove)
    const onPointerUp = (event: PointerEvent) => finishDrag(event, true)
    const onPointerCancel = (event: PointerEvent) => finishDrag(event, false)
    element.addEventListener('pointerup', onPointerUp)
    element.addEventListener('pointercancel', onPointerCancel)
    element.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      element.style.cursor = 'auto'
      element.style.touchAction = 'pan-y'
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointerleave', onPointerLeave)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerup', onPointerUp)
      element.removeEventListener('pointercancel', onPointerCancel)
      element.removeEventListener('wheel', onWheel)
    }
  }, [camera, gl, raycaster, router])

  useEffect(() => {
    const element = gl.domElement
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.4) return
        ringRef.current?.startIntro()
        observer.disconnect()
      },
      { threshold: [0, 0.4, 0.65] },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [gl])

  useFrame((_, delta) => {
    const ring = ringRef.current
    if (!ring) return
    if (!dragging.current) {
      velocity.current *= Math.exp(-VELOCITY_DAMPING * delta)
      if (Math.abs(velocity.current) < 0.02) velocity.current = 0
      const cruise = ring.settled ? IDLE_SPIN : 0
      ring.add((cruise + velocity.current) * delta)
    }
    ring.update(delta)
  })

  return <primitive object={gltf.scene} />
}

useGLTF.preload(MODEL_PATH)
