'use client'

import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { PerspectiveCamera, Quaternion, Vector3 } from 'three'

import { NGWServiceCategory } from '@/components/3d/ngw-service-category'
import { getCategoryServices, NGW_CATEGORY_ORDER } from '@/data/ngw-service-catalog'

const MODEL_PATH = '/3d/ngw-services.glb'
const ORBIT_RELEASE_DELAY = 700

const worldPosition = new Vector3()
const worldQuaternion = new Quaternion()

function ExportedCamera() {
  const gltf = useGLTF(MODEL_PATH)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  useLayoutEffect(() => {
    const source = gltf.cameras[0]
    if (!(source instanceof PerspectiveCamera) || !(camera instanceof PerspectiveCamera)) return

    gltf.scene.updateMatrixWorld(true)
    source.getWorldPosition(worldPosition)
    source.getWorldQuaternion(worldQuaternion)

    camera.position.copy(worldPosition)
    camera.quaternion.copy(worldQuaternion)
    camera.fov = source.fov
    camera.near = source.near
    camera.far = source.far
    camera.aspect = size.width / Math.max(size.height, 1)
    camera.updateProjectionMatrix()
  }, [camera, gltf, size.height, size.width])

  return null
}

export function NGWScene() {
  const gltf = useGLTF(MODEL_PATH)
  const gl = useThree((state) => state.gl)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const activeRef = useRef<string | null>(null)
  const releaseToken = useRef(0)

  const categories = useMemo(
    () =>
      NGW_CATEGORY_ORDER.map((name) => {
        const object = gltf.scene.getObjectByName(name)
        if (!object) throw new Error(`Missing GLB object ${name}`)
        return object
      }),
    [gltf.scene],
  )

  const retainCategory = useCallback((name: string) => {
    releaseToken.current += 1
    activeRef.current = name
    setActiveCategory((current) => (current === name ? current : name))
  }, [])

  const releaseCategory = useCallback((name: string) => {
    const token = releaseToken.current
    window.setTimeout(() => {
      if (releaseToken.current !== token) return
      if (activeRef.current !== name) return
      activeRef.current = null
      setActiveCategory(null)
    }, ORBIT_RELEASE_DELAY)
  }, [])

  useEffect(() => {
    return () => {
      releaseToken.current += 1
    }
  }, [])

  useEffect(() => {
    gl.domElement.style.cursor = activeCategory ? 'pointer' : 'auto'
    return () => {
      gl.domElement.style.cursor = 'auto'
    }
  }, [activeCategory, gl])

  return (
    <>
      <ExportedCamera />
      {categories.map((object) => (
        <NGWServiceCategory
          key={object.uuid}
          object={object}
          name={object.name}
          services={getCategoryServices(object.name)}
          active={activeCategory === object.name}
          dimmed={activeCategory !== null && activeCategory !== object.name}
          onEnter={retainCategory}
          onLeave={releaseCategory}
        />
      ))}
    </>
  )
}

useGLTF.preload(MODEL_PATH)
