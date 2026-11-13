import { Euler, PerspectiveCamera, Vector3, type Object3D } from 'three'

export const SERVICE_PANEL = {
  width: 2.15,
  height: 0.88,
  depth: 0.4,
}

/** Development path. Set to false to hide the orbit guide. */
export const SHOW_ORBIT_GUIDE = true

const VERTICAL_WAVE = 0.18
const VERTICAL_BIAS = 0.2

export type OrbitRadii = {
  radiusX: number
  radiusY: number
  radiusZ: number
}

export function getOrbitRadii(
  object: Object3D,
  camera: PerspectiveCamera,
  viewportHeight: number,
  total: number,
): OrbitRadii {
  const center = object.getWorldPosition(new Vector3())
  const distance = camera.position.distanceTo(center)
  const visibleHeight = 2 * distance * Math.tan((camera.fov * Math.PI) / 360)
  const unitsPerPixel = visibleHeight / Math.max(viewportHeight, 1)
  const projected = center.clone().project(camera)
  const pixelY = (-projected.y * 0.5 + 0.5) * viewportHeight
  const panelHalf = SERVICE_PANEL.height / 2 + 0.15
  const spaceAbove = Math.max(pixelY - 10, 0) * unitsPerPixel - panelHalf
  const spaceBelow = Math.max(viewportHeight - pixelY - 10, 0) * unitsPerPixel - panelHalf
  const spacing = SERVICE_PANEL.width + 0.55
  const needed = (total * spacing) / (2 * Math.PI)
  const radiusX = Math.max(needed, 6.35)
  const headroom = Math.min(spaceAbove / 0.58, spaceBelow / 1)
  const radiusY = Math.max(2.2, Math.min(3.6, headroom))
  const radiusZ = Math.max(10.5, radiusX * 1.35)

  return { radiusX, radiusY, radiusZ }
}

export type OrbitPoint = {
  x: number
  y: number
  z: number
}

export function get3DOrbitPoint(theta: number, radiusX: number, radiusY: number, radiusZ: number): OrbitPoint {
  const around = Math.sin(theta)

  return {
    x: Math.cos(theta) * radiusX,
    y: (around * 0.55 + Math.sin(theta * 2) * VERTICAL_WAVE - VERTICAL_BIAS) * radiusY,
    z: (around + Math.cos(theta) * 0.28) * radiusZ,
  }
}

export type OrbitPlacement = {
  position: Vector3
  rotation: Euler
  depth: number
}

export function get3DOrbitPosition(
  index: number,
  total: number,
  radiusX: number,
  radiusY: number = radiusX,
  radiusZ: number = radiusX,
): OrbitPlacement {
  const theta = -Math.PI / 2 + (index / Math.max(total, 1)) * Math.PI * 2
  const point = get3DOrbitPoint(theta, radiusX, radiusY, radiusZ)
  const depth = Math.max(-1, Math.min(1, point.z / (radiusZ * 1.04 || 1)))

  return {
    position: new Vector3(point.x, point.y, point.z),
    rotation: new Euler(Math.sin(theta) * 0.32, -Math.cos(theta) * 0.48, Math.sin(theta * 2) * 0.05),
    depth,
  }
}
