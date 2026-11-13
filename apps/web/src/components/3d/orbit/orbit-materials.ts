import { Color, Mesh, type Material, type MeshStandardMaterial, type Object3D } from 'three'

import type { HoverMaterial, PartRole } from '@/components/3d/orbit/types'

const SITE_BLUE = new Color('#0755f5')
const EDGE_GLOW = new Color(0.07, 0.2, 0.72)
const TEXT_GLOW = new Color(0.05, 0.12, 0.34)
const CATEGORY_GLOW = SITE_BLUE
const TITLE_GLOW = new Color(1, 1, 1)

const colorScratch = new Color()
const emissiveScratch = new Color()

function isLitMaterial(material: Material): material is MeshStandardMaterial {
  return 'color' in material && 'emissive' in material && 'emissiveIntensity' in material
}

function partRole(name: string): PartRole {
  if (name.endsWith('_Edge')) return 'edge'
  if (name.endsWith('_Text') || name.endsWith('_Label')) return 'text'
  if (name.endsWith('_Body')) return 'body'
  return 'other'
}

export function isolateMaterials(root: Object3D) {
  root.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh || mesh.userData.orbitHoverIsolated) return

    const source = mesh.material
    mesh.userData.orbitHoverIsolated = true
    mesh.userData.orbitHoverSource = source
    mesh.material = Array.isArray(source) ? source.map((material) => material.clone()) : source.clone()
  })
}

export function restoreMaterials(root: Object3D) {
  root.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh || !mesh.userData.orbitHoverIsolated) return
    mesh.material = mesh.userData.orbitHoverSource
    delete mesh.userData.orbitHoverIsolated
    delete mesh.userData.orbitHoverSource
  })
}

export function snapshotMaterials(root: Object3D) {
  const seen = new Set<MeshStandardMaterial>()
  const snapshots: HoverMaterial[] = []

  root.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh) return

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const source of materials) {
      if (!isLitMaterial(source) || seen.has(source)) continue
      seen.add(source)
      snapshots.push({
        material: source,
        color: source.color.clone(),
        emissive: source.emissive.clone(),
        emissiveIntensity: source.emissiveIntensity,
        opacity: source.opacity,
        transparent: source.transparent,
        depthWrite: source.depthWrite,
        role: partRole(mesh.name),
      })
    }
  })

  return snapshots
}

export function restoreSnapshot(snapshot: HoverMaterial) {
  snapshot.material.color.copy(snapshot.color)
  snapshot.material.emissive.copy(snapshot.emissive)
  snapshot.material.emissiveIntensity = snapshot.emissiveIntensity
  snapshot.material.opacity = snapshot.opacity
  snapshot.material.transparent = snapshot.transparent
  snapshot.material.depthWrite = snapshot.depthWrite
}

export function paintServiceMaterial(snapshot: HoverMaterial, emphasis: number, presence: number) {
  const material = snapshot.material
  let brightness = 1
  let glow = 0
  let glowColor = EDGE_GLOW
  let intensityBoost = 0

  if (snapshot.role === 'edge') {
    glow = emphasis
    intensityBoost = 1.15 * emphasis
  } else if (snapshot.role === 'text') {
    brightness = 1 + 0.34 * emphasis
    glow = emphasis
    glowColor = TEXT_GLOW
    intensityBoost = 0.4 * emphasis
  } else if (snapshot.role === 'body') {
    brightness = 1 + 0.05 * emphasis
  }

  colorScratch.copy(snapshot.color).multiplyScalar(brightness)
  material.color.copy(colorScratch)
  emissiveScratch.copy(glowColor).multiplyScalar(glow).add(snapshot.emissive)
  material.emissive.copy(emissiveScratch)
  material.emissiveIntensity = snapshot.emissiveIntensity + intensityBoost
  material.opacity = snapshot.opacity * presence

  const faded = presence < 0.985
  const transparent = faded || snapshot.transparent
  const depthWrite = snapshot.depthWrite && !faded
  if (material.transparent !== transparent || material.depthWrite !== depthWrite) {
    material.transparent = transparent
    material.depthWrite = depthWrite
    material.needsUpdate = true
  }
}

export function paintCategoryMaterial(snapshot: HoverMaterial, presence: number) {
  const edge = snapshot.material.name.includes('_Edge')
  const title = snapshot.role === 'text'
  const front = snapshot.material.name.includes('_Front') && snapshot.material.map
  if (!edge && !title) {
    if (front) {
      snapshot.material.color.setRGB(1.35, 1.35, 1.35)
      snapshot.material.emissive.set('#ffffff')
      if (snapshot.material.emissiveMap !== snapshot.material.map) {
        snapshot.material.emissiveMap = snapshot.material.map
        snapshot.material.needsUpdate = true
      }
      snapshot.material.emissiveIntensity = 0.85
      return
    }
    snapshot.material.color.copy(snapshot.color)
    snapshot.material.emissive.copy(snapshot.emissive)
    snapshot.material.emissiveIntensity = snapshot.emissiveIntensity
    return
  }

  if (title) {
    snapshot.material.color.copy(snapshot.color)
    emissiveScratch.copy(TITLE_GLOW).add(snapshot.emissive)
    snapshot.material.emissive.copy(emissiveScratch)
    snapshot.material.emissiveIntensity = snapshot.emissiveIntensity + 2.4
    return
  }

  colorScratch.copy(snapshot.color).multiplyScalar(1 + 0.45 * presence)
  snapshot.material.color.copy(colorScratch)
  emissiveScratch.copy(CATEGORY_GLOW).multiplyScalar(presence).add(snapshot.emissive)
  snapshot.material.emissive.copy(emissiveScratch)
  snapshot.material.emissiveIntensity = snapshot.emissiveIntensity + 1.6 * presence
}

export function paintDimmedMaterial(snapshot: HoverMaterial, focus: number) {
  const emphasis = 1 - (1 - 0.76) * focus
  colorScratch.copy(snapshot.color).multiplyScalar(emphasis)
  snapshot.material.color.copy(colorScratch)
  snapshot.material.emissive.copy(snapshot.emissive)
  snapshot.material.emissiveIntensity = snapshot.emissiveIntensity
}
