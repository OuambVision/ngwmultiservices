import { Quaternion, Vector3 } from 'three'

// In this GLB the camera's up axis is world -Z. The orbit node is aligned so
// its local Y matches that vertical axis. The ring then lies on local X/Z:
//   x = radius * cos(angle)
//   z = radius * sin(angle)
//   y = 0
// Every service is the same distance from the center, on one horizontal plane.
export const SCENE_UP = new Vector3(0, 0, -1)

const localUp = new Vector3(0, 1, 0)

export function horizontalAlignment(target = new Quaternion()) {
  return target.setFromUnitVectors(localUp, SCENE_UP)
}

export function circlePosition(index: number, count: number, radius: number, target: Vector3) {
  const angle = (index / count) * Math.PI * 2
  target.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
  return target
}
