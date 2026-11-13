'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const fallbackSlides = [
  '/hero/hero.png',
  '/hero/hero-residentiel.png',
  '/hero/hero-commercial.png',
  '/hero/hero-tapis-meuble.png',
  '/hero/hero-demenagement.png',
  '/hero/hero-montage-installation.png',
  '/hero/hero-maintenance-legere.png',
]

const holdMs = 4500
const fadeMs = 2500

export function HeroSlideshow({ images }: { images: string[] }) {
  const slides = images.length > 0 ? images : fallbackSlides
  const [index, setIndex] = useState(0)
  const [under, setUnder] = useState(0)
  const [motionOk, setMotionOk] = useState(false)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches || slides.length < 2) return
    setMotionOk(true)
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, holdMs)
    return () => window.clearInterval(timer)
  }, [slides.length])

  useEffect(() => {
    if (index === under) return
    const timer = window.setTimeout(() => setUnder(index), fadeMs)
    return () => window.clearTimeout(timer)
  }, [index, under])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {slides.map((src, slideIndex) => {
        const active = slideIndex === index
        const base = slideIndex === under
        const fromLeft = slideIndex % 2 === 0
        const parked = fromLeft ? '-translate-x-full' : 'translate-x-full'
        return (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={slideIndex === 0}
            sizes="100vw"
            className={`object-cover object-[70%_center] ${
              motionOk ? 'transition-[translate] duration-[1500ms] ease-in-out' : ''
            } ${active ? 'z-10' : 'z-0'} ${
              !motionOk
                ? active
                  ? 'translate-x-0 opacity-100'
                  : 'translate-x-0 opacity-0'
                : active || base
                  ? 'translate-x-0'
                  : parked
            }`}
          />
        )
      })}
    </div>
  )
}
