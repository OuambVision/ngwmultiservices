'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'

import { NgwOrbitScene } from '@/components/3d/ngw-orbit-scene'

type NgwOrbitCanvasProps = {
  onHover?: (name: string | null) => void
}

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

export function NgwOrbitCanvas({ onHover }: NgwOrbitCanvasProps) {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 2]}
      camera={{ fov: 19.8, near: 0.1, far: 400, position: [30.18, 51.69, -13.21] }}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1,
        outputColorSpace: SRGBColorSpace,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor('#f1f5fc', 0)
      }}
    >
      <StudioLights />
      <Suspense fallback={null}>
        <NgwOrbitScene onHover={onHover} />
      </Suspense>
    </Canvas>
  )
}
