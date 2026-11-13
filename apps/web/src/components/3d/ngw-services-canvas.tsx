'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'

import { NGWScene } from '@/components/3d/ngw-scene'

function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.22} color="#c9d4e6" />
      <directionalLight position={[22, 34, -8]} intensity={1.45} color="#e8eef8" />
      <directionalLight position={[-18, 12, 16]} intensity={0.55} color="#3a6dff" />
      <directionalLight position={[6, -10, 4]} intensity={0.2} color="#2f62ff" />
    </>
  )
}

export function NgwServicesCanvas() {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 1.75]}
      camera={{ fov: 19.8, near: 0.1, far: 400, position: [30.18, 51.69, -13.21] }}
      gl={{
        antialias: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1,
        outputColorSpace: SRGBColorSpace,
      }}
    >
      <color attach="background" args={['#020305']} />
      <StudioLights />
      <Suspense fallback={null}>
        <NGWScene />
      </Suspense>
    </Canvas>
  )
}
