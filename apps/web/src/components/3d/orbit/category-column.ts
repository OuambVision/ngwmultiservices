import { Mesh, PerspectiveCamera, Vector3, type Material, type Object3D } from 'three'

import { categoryOrbitConfigs } from '@/components/3d/orbit/category-orbit-config'
import { SCENE_UP } from '@/components/3d/orbit/circle'

const COLUMN_ORDER = [
  'NGW_Automotive',
  'NGW_Commercial',
  'NGW_Residential',
  'NGW_Specialized',
  'NGW_Demenagement',
  'NGW_PetiteMaintenance',
] as const

const ROW_SPACING = 10.5
const DESKTOP_COLUMN_GAP = 13
const DESKTOP_MIN_WIDTH = 768
const ENTER_SLIDE = 6
const ENTER_STAGGER = 0.22
const ENTER_DURATION = 0.85

const forward = new Vector3()
const screenRight = new Vector3()

type MaterialSnapshot = {
  material: Material
  opacity: number
  transparent: boolean
  depthWrite: boolean
}

type ColumnRow = {
  category: Object3D
  orbit: Object3D | null
  originalCategory: Vector3
  originalOrbit: Vector3 | null
  originWorld: Vector3
  centerWorld: Vector3
  orbitOriginWorld: Vector3 | null
  fromCategory: Vector3
  toCategory: Vector3
  fromOrbit: Vector3 | null
  toOrbit: Vector3 | null
  materials: MaterialSnapshot[]
}

export type CategoryColumn = {
  layout: (width: number, aspect: number) => void
  update: (now: number) => void
  setScroll: (progress: number) => void
  restore: () => void
}

function orbitFor(categoryName: string) {
  return categoryOrbitConfigs.find((config) => config.categoryObject === categoryName)?.orbitObject
}

function localForWorld(object: Object3D, world: Vector3, target: Vector3) {
  target.copy(world)
  object.parent?.worldToLocal(target)
  return target
}

function blockCenter(object: Object3D, target: Vector3) {
  const mesh = object as Mesh
  if (!mesh.isMesh || !mesh.geometry) return object.getWorldPosition(target)
  if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
  const box = mesh.geometry.boundingBox
  if (!box) return object.getWorldPosition(target)
  box.getCenter(target)
  return object.localToWorld(target)
}

function collectMaterials(root: Object3D) {
  const seen = new Set<Material>()
  const materials: MaterialSnapshot[] = []
  root.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh) return
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of list) {
      if (seen.has(material)) continue
      seen.add(material)
      materials.push({
        material,
        opacity: material.opacity,
        transparent: material.transparent,
        depthWrite: material.depthWrite,
      })
    }
  })
  return materials
}

function paintOpacity(materials: MaterialSnapshot[], opacity: number) {
  const revealed = opacity > 0.985
  for (const snapshot of materials) {
    const material = snapshot.material
    material.opacity = snapshot.opacity * opacity
    const transparent = !revealed || snapshot.transparent
    const depthWrite = snapshot.depthWrite && revealed
    if (material.transparent !== transparent || material.depthWrite !== depthWrite) {
      material.transparent = transparent
      material.depthWrite = depthWrite
      material.needsUpdate = true
    }
  }
}

function restoreMaterials(materials: MaterialSnapshot[]) {
  for (const snapshot of materials) {
    snapshot.material.opacity = snapshot.opacity
    snapshot.material.transparent = snapshot.transparent
    snapshot.material.depthWrite = snapshot.depthWrite
    snapshot.material.needsUpdate = true
  }
}

function easeOut(progress: number) {
  return 1 - (1 - progress) ** 3
}

export function createCategoryColumn(scene: Object3D, camera: PerspectiveCamera): CategoryColumn {
  scene.updateMatrixWorld(true)
  const anchor = new Vector3()
  const rows: ColumnRow[] = COLUMN_ORDER.flatMap((name) => {
    const category = scene.getObjectByName(name)
    if (!category) return []
    const centerWorld = blockCenter(category, new Vector3())
    anchor.add(centerWorld)
    const orbitName = orbitFor(category.name)
    const orbit = orbitName ? (scene.getObjectByName(orbitName) ?? null) : null
    return [
      {
        category,
        orbit,
        originalCategory: category.position.clone(),
        originalOrbit: orbit ? orbit.position.clone() : null,
        originWorld: category.getWorldPosition(new Vector3()),
        centerWorld,
        orbitOriginWorld: orbit ? orbit.getWorldPosition(new Vector3()) : null,
        fromCategory: new Vector3(),
        toCategory: new Vector3(),
        fromOrbit: orbit ? new Vector3() : null,
        toOrbit: orbit ? new Vector3() : null,
        materials: collectMaterials(category),
      },
    ]
  })
  if (rows.length > 0) anchor.multiplyScalar(1 / rows.length)

  const originalCamera = camera.position.clone()
  const slots = rows.map(() => new Vector3())
  let baseCamera = camera.position.clone()
  let travel = 0
  let scroll = 0
  let signature = ''
  let introduced = false
  const startedAt = performance.now()
  let done = false
  const edge = new Vector3()

  const applyScroll = () => {
    camera.position.copy(baseCamera).addScaledVector(SCENE_UP, -travel * scroll)
  }

  const layout = (width: number, aspect: number) => {
    const wide = width >= DESKTOP_MIN_WIDTH
    const columns = wide ? 2 : 1
    const nextSignature = `${columns}:${aspect.toFixed(2)}`
    if (nextSignature === signature) return
    signature = nextSignature

    camera.getWorldDirection(forward)
    screenRight.set(1, 0, 0).applyQuaternion(camera.quaternion)
    screenRight.addScaledVector(SCENE_UP, -screenRight.dot(SCENE_UP))
    if (screenRight.lengthSq() < 1e-6) screenRight.set(1, 0, 0)
    screenRight.normalize()

    const rowCount = Math.ceil(rows.length / columns)
    rows.forEach((row, index) => {
      const line = Math.floor(index / columns)
      const column = index % columns
      const itemsInLine = Math.min(columns, rows.length - line * columns)
      const columnOffset = (column - (itemsInLine - 1) / 2) * (columns === 1 ? 0 : DESKTOP_COLUMN_GAP)
      const lineOffset = ((rowCount - 1) / 2 - line) * ROW_SPACING
      const slot = slots[index]
      slot
        .copy(anchor)
        .addScaledVector(screenRight, columnOffset)
        .addScaledVector(SCENE_UP, lineOffset)
      const shift = slot.clone().sub(row.centerWorld)
      const originWorld = row.originWorld.clone().add(shift)
      localForWorld(row.category, originWorld, row.toCategory)
      if (row.orbit && row.toOrbit && row.orbitOriginWorld) {
        localForWorld(row.orbit, row.orbitOriginWorld.clone().add(shift), row.toOrbit)
      }
    })

    const focus = slots[0].clone()
    if (columns === 2 && slots[1]) focus.add(slots[1]).multiplyScalar(0.5)
    camera.position.copy(originalCamera)
    camera.updateMatrixWorld()
    let distance = Math.max(camera.position.distanceTo(focus), 1)
    const horizontalReach = columns === 2 ? 4.8 : 4.6
    const verticalTarget = columns === 2 ? 0.5 : 0.52
    const horizontalTarget = columns === 2 ? 0.9 : 0.82
    const measure = () => {
      camera.position.copy(focus).addScaledVector(forward, -distance)
      camera.updateMatrixWorld()
      let maxY = 0
      let maxX = 0
      const sample = columns === 2 && slots[1] ? [slots[0], slots[1]] : [slots[0]]
      for (const slot of sample) {
        if (!slot) continue
        for (const sign of [-1, 1] as const) {
          edge.copy(slot).addScaledVector(SCENE_UP, sign * 3.4)
          edge.project(camera)
          maxY = Math.max(maxY, Math.abs(edge.y))
          edge.copy(slot).addScaledVector(screenRight, sign * horizontalReach)
          edge.project(camera)
          maxX = Math.max(maxX, Math.abs(edge.x))
        }
      }
      return { maxY, maxX }
    }
    for (let step = 0; step < 18; step += 1) {
      const { maxY, maxX } = measure()
      if (maxY >= verticalTarget || maxX >= horizontalTarget) break
      distance *= 0.88
    }
    const overflow = measure()
    if (overflow.maxX > horizontalTarget + 0.08 || overflow.maxY > verticalTarget + 0.16) distance *= 1.12
    camera.position.copy(focus).addScaledVector(forward, -distance)
    camera.updateProjectionMatrix()
    baseCamera = camera.position.clone()
    travel = Math.max(rowCount - 1, 0) * ROW_SPACING
    applyScroll()

    if (!introduced) {
      for (const row of rows) {
        const fromWorld = row.toCategory.clone()
        row.category.parent?.localToWorld(fromWorld)
        fromWorld.addScaledVector(SCENE_UP, -ENTER_SLIDE)
        localForWorld(row.category, fromWorld, row.fromCategory)
        if (row.orbit && row.toOrbit && row.fromOrbit) {
          const orbitFrom = row.toOrbit.clone()
          row.orbit.parent?.localToWorld(orbitFrom)
          orbitFrom.addScaledVector(SCENE_UP, -ENTER_SLIDE)
          localForWorld(row.orbit, orbitFrom, row.fromOrbit)
        }
        row.category.position.copy(row.fromCategory)
        if (row.orbit && row.fromOrbit) row.orbit.position.copy(row.fromOrbit)
        paintOpacity(row.materials, 0)
      }
      introduced = true
      return
    }

    if (done) {
      for (const row of rows) {
        row.category.position.copy(row.toCategory)
        if (row.orbit && row.toOrbit) row.orbit.position.copy(row.toOrbit)
      }
      return
    }

    for (const row of rows) {
      row.fromCategory.copy(row.category.position)
      if (row.orbit && row.fromOrbit) row.fromOrbit.copy(row.orbit.position)
    }
  }

  return {
    layout,
    setScroll(progress: number) {
      scroll = Math.min(Math.max(progress, 0), 1)
      applyScroll()
    },
    update(now) {
      applyScroll()
      if (done) return
      const elapsed = (now - startedAt) / 1000
      let finished = true
      for (const [index, row] of rows.entries()) {
        const progress = Math.min(Math.max((elapsed - index * ENTER_STAGGER) / ENTER_DURATION, 0), 1)
        if (progress < 1) finished = false
        const eased = easeOut(progress)
        row.category.position.lerpVectors(row.fromCategory, row.toCategory, eased)
        if (row.orbit && row.fromOrbit && row.toOrbit) {
          row.orbit.position.lerpVectors(row.fromOrbit, row.toOrbit, eased)
        }
        paintOpacity(row.materials, eased)
      }
      if (finished) done = true
    },
    restore() {
      for (const row of rows) {
        row.category.position.copy(row.originalCategory)
        if (row.orbit && row.originalOrbit) row.orbit.position.copy(row.originalOrbit)
        restoreMaterials(row.materials)
      }
      camera.position.copy(originalCamera)
      camera.updateProjectionMatrix()
    },
  }
}
