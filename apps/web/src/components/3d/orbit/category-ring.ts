import {
  Box3,
  Color,
  Plane,
  Quaternion,
  Vector3,
  type Mesh,
  type Object3D,
  type PerspectiveCamera,
  type Raycaster,
} from 'three'

import { SCENE_UP } from '@/components/3d/orbit/circle'
import {
  isolateMaterials,
  paintCategoryMaterial,
  restoreMaterials,
  restoreSnapshot,
  snapshotMaterials,
} from '@/components/3d/orbit/orbit-materials'
import type { HoverMaterial } from '@/components/3d/orbit/types'

const CATEGORY_NAMES = [
  'NGW_Automotive',
  'NGW_Commercial',
  'NGW_Residential',
  'NGW_Specialized',
  'NGW_AllServices',
] as const

const LABEL_COLOR = new Color('#ffffff')
const SITE_BLUE = new Color('#0755f5')
const HOVER_SCALE = 1.18
const HOVER_SMOOTHING = 8
const INTRO_LEAD = 0.12
const INTRO_STAGGER = 0.42
const INTRO_DURATION = 1.7
const DROP_HEIGHT = 12
const DROP_BOUNCE = 20
const TAP_KEYS: Array<[number, number]> = [
  [0, 0],
  [0.18, 0.38],
  [0.32, 0.82],
  [0.42, 1.04],
  [0.52, 0.974],
  [0.62, 1.026],
  [0.72, 0.986],
  [0.82, 1.016],
  [0.9, 0.994],
  [0.96, 1.009],
  [1, 1],
]

type Slot = {
  object: Object3D
  offset: Vector3
  originalPosition: Vector3
  originalQuaternion: Quaternion
  baseScale: Vector3
  materials: HoverMaterial[]
  presence: number
}

export type CategoryRing = {
  objects: Object3D[]
  angle: number
  add: (delta: number) => void
  hover: (object: Object3D | null) => void
  startIntro: () => void
  readonly settled: boolean
  categoryAt: (raycaster: Raycaster) => Object3D | null
  inside: (raycaster: Raycaster) => boolean
  update: (delta: number) => void
  frame: (
    camera: PerspectiveCamera,
    basePosition: Vector3,
    baseQuaternion: Quaternion,
    fit?: number,
  ) => void
  restore: () => void
}

const spin = new Quaternion()
const world = new Vector3()
const forward = new Vector3()
const screenUp = new Vector3()
const probe = new Vector3()
const hitPoint = new Vector3()
const orbitPlane = new Plane()
const bounds = new Box3()

function tapBounce(amount: number) {
  if (amount <= 0) return 0
  if (amount >= 1) return 1
  let index = 1
  while (index < TAP_KEYS.length && TAP_KEYS[index][0] < amount) index += 1
  const [startTime, startValue] = TAP_KEYS[index - 1]
  const [endTime, endValue] = TAP_KEYS[index]
  const span = endTime - startTime
  const local = span === 0 ? 1 : (amount - startTime) / span
  const smooth = local * local * (3 - 2 * local)
  return startValue + (endValue - startValue) * smooth
}

function introProgress(elapsed: number, index: number) {
  if (elapsed < 0) return -1
  return (elapsed - INTRO_LEAD - index * INTRO_STAGGER) / INTRO_DURATION
}

function paintSiteEdges(object: Object3D) {
  object.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh) return
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) {
      if (!material.name.includes('_Edge') || !('color' in material) || !('emissive' in material))
        continue
      const edge = material as Mesh['material'] & { color: Color; emissive: Color }
      edge.color.copy(SITE_BLUE)
      edge.emissive.copy(SITE_BLUE)
    }
  })
}

function paintNavyLabels(object: Object3D) {
  object.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh || !mesh.name.endsWith('_Label')) return
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) {
      if (!('color' in material)) continue
      const lit = material as Mesh['material'] & {
        color: Color
        emissive?: Color
        emissiveIntensity?: number
      }
      lit.color.copy(LABEL_COLOR)
      lit.emissive?.set(0, 0, 0)
      if (lit.emissiveIntensity !== undefined) lit.emissiveIntensity = 0
    }
  })
}

export function createCategoryRing(scene: Object3D): CategoryRing {
  scene.updateMatrixWorld(true)
  const objects = CATEGORY_NAMES.flatMap((name) => {
    const object = scene.getObjectByName(name)
    return object ? [object] : []
  })
  const center = new Vector3()
  for (const object of objects) center.add(object.getWorldPosition(new Vector3()))
  if (objects.length > 0) center.multiplyScalar(1 / objects.length)

  const slots: Slot[] = objects.map((object) => {
    isolateMaterials(object)
    paintSiteEdges(object)
    paintNavyLabels(object)
    return {
      object,
      offset: object.getWorldPosition(new Vector3()).sub(center),
      originalPosition: object.position.clone(),
      originalQuaternion: object.quaternion.clone(),
      baseScale: object.scale.clone(),
      materials: snapshotMaterials(object),
      presence: 0,
    }
  })
  let reach = 0
  for (const slot of slots) reach = Math.max(reach, slot.offset.length())
  if (objects[0]) {
    bounds.setFromObject(objects[0])
    reach +=
      Math.max(
        bounds.max.x - bounds.min.x,
        bounds.max.y - bounds.min.y,
        bounds.max.z - bounds.min.z,
      ) / 2
  }
  let angle = 0
  let hovered: Object3D | null = null
  let introElapsed = -1
  const ranks = slots.map((_, index) => index)

  const rankFromTop = (camera: PerspectiveCamera) => {
    const scored = slots.map((slot, index) => {
      probe.copy(slot.offset).add(center).project(camera)
      return { index, y: Number.isFinite(probe.y) ? probe.y : 0 }
    })
    scored.sort((a, b) => b.y - a.y)
    scored.forEach((item, rank) => {
      ranks[item.index] = rank
    })
  }

  const introFinished = () =>
    introElapsed >= INTRO_LEAD + (slots.length - 1) * INTRO_STAGGER + INTRO_DURATION

  const apply = (delta: number) => {
    if (introElapsed >= 0 && Number.isFinite(delta) && delta > 0) introElapsed += delta
    spin.setFromAxisAngle(SCENE_UP, angle)
    const step = Number.isFinite(delta) ? 1 - Math.exp(-HOVER_SMOOTHING * delta) : 0
    slots.forEach((slot, index) => {
      const progress = introProgress(introElapsed, ranks[index])
      const arrival = tapBounce(progress)
      const shown = progress >= 0
      const rest = 1 - Math.min(Math.max(arrival, 0), 1)
      const overshoot = Math.max(arrival - 1, 0)
      const lift = rest * DROP_HEIGHT - overshoot * DROP_BOUNCE
      world.copy(slot.offset).applyQuaternion(spin).add(center).addScaledVector(SCENE_UP, lift)
      slot.object.parent?.worldToLocal(world)
      slot.object.position.copy(world)
      slot.object.quaternion.copy(slot.originalQuaternion)
      slot.object.visible = shown
      const landed = progress >= 1
      const target = landed && slot.object === hovered ? 1 : 0
      if (!Number.isFinite(slot.presence)) slot.presence = 0
      slot.presence += (target - slot.presence) * step
      const factor = (shown ? 1 : 0) * (1 + (HOVER_SCALE - 1) * slot.presence)
      slot.object.scale.set(
        slot.baseScale.x * factor,
        slot.baseScale.y * factor,
        slot.baseScale.z * factor,
      )
      for (const snapshot of slot.materials)
        paintCategoryMaterial(snapshot, landed ? slot.presence : 0)
    })
  }

  return {
    objects,
    get angle() {
      return angle
    },
    set angle(value: number) {
      angle = value
    },
    add(delta: number) {
      angle += delta
    },
    hover(object: Object3D | null) {
      hovered = object
    },
    startIntro() {
      if (introElapsed >= 0) return
      introElapsed = 0
    },
    get settled() {
      return introFinished()
    },
    categoryAt(raycaster: Raycaster) {
      const hit = raycaster.intersectObjects(objects, true)[0]
      if (!hit) return null
      let current: Object3D | null = hit.object
      while (current) {
        if (objects.includes(current)) return current
        current = current.parent
      }
      return null
    },
    inside(raycaster: Raycaster) {
      orbitPlane.setFromNormalAndCoplanarPoint(SCENE_UP, center)
      if (!raycaster.ray.intersectPlane(orbitPlane, hitPoint)) return false
      return hitPoint.distanceTo(center) <= reach
    },
    update: apply,
    frame(camera, basePosition, baseQuaternion, fit = 0.74) {
      spin.setFromAxisAngle(SCENE_UP, angle)
      for (const slot of slots) {
        slot.object.scale.copy(slot.baseScale)
        world.copy(slot.offset).applyQuaternion(spin).add(center)
        slot.object.parent?.worldToLocal(world)
        slot.object.position.copy(world)
      }
      camera.position.copy(basePosition)
      camera.quaternion.copy(baseQuaternion)
      camera.updateMatrixWorld()
      camera.getWorldDirection(forward)
      screenUp.set(0, 1, 0).applyQuaternion(camera.quaternion)
      let distance = Math.max(camera.position.distanceTo(center), 1)
      let shift = 0
      const place = () => {
        camera.position
          .copy(center)
          .addScaledVector(forward, -distance)
          .addScaledVector(screenUp, shift)
        camera.updateMatrixWorld()
      }
      const sample = () => {
        place()
        let minY = Infinity
        let maxY = -Infinity
        let maxX = 0
        const considerPoint = () => {
          probe.project(camera)
          if (!Number.isFinite(probe.x) || Math.abs(probe.x) > 4 || Math.abs(probe.y) > 4) return
          minY = Math.min(minY, probe.y)
          maxY = Math.max(maxY, probe.y)
          maxX = Math.max(maxX, Math.abs(probe.x))
        }
        for (const object of objects) {
          object.traverse((child) => {
            const mesh = child as Mesh
            if (!mesh.isMesh || !mesh.geometry) return
            if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
            const box = mesh.geometry.boundingBox
            if (!box) return
            for (const x of [box.min.x, box.max.x]) {
              for (const y of [box.min.y, box.max.y]) {
                for (const z of [box.min.z, box.max.z]) {
                  probe.set(x, y, z)
                  mesh.localToWorld(probe)
                  considerPoint()
                }
              }
            }
          })
        }
        return { minY, maxY, maxX }
      }
      for (let step = 0; step < 28; step += 1) {
        const { minY, maxY, maxX } = sample()
        if (
          ![minY, maxY, maxX].every(Number.isFinite) ||
          Math.abs(minY) > 2 ||
          Math.abs(maxY) > 2
        ) {
          shift = 0
          distance *= 1.12
          continue
        }
        const mid = (minY + maxY) / 2
        const halfSpan = Math.max(maxX, (maxY - minY) / 2)
        const halfHeight = distance * Math.tan((camera.fov * Math.PI) / 360)
        shift += mid * halfHeight * 0.8
        if (halfSpan > fit) distance *= 1.04
        else if (halfSpan < fit * 0.96) distance *= 0.96
        if (Math.abs(mid) < 0.02 && Math.abs(halfSpan - fit) < 0.025) break
      }
      place()
      camera.updateProjectionMatrix()
      if (introElapsed < 0) rankFromTop(camera)
      apply(0)
    },
    restore() {
      for (const slot of slots) {
        slot.object.position.copy(slot.originalPosition)
        slot.object.quaternion.copy(slot.originalQuaternion)
        slot.object.scale.copy(slot.baseScale)
        slot.object.visible = true
        for (const snapshot of slot.materials) restoreSnapshot(snapshot)
        restoreMaterials(slot.object)
      }
    },
  }
}
