'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export type ServiceSlide = { alt: string; src: string }

type GalleryContextValue = {
  images: ServiceSlide[]
  open: (index: number) => void
}

const GalleryContext = createContext<GalleryContextValue | null>(null)

function useGallery() {
  const value = useContext(GalleryContext)
  if (!value) throw new Error('Service gallery is missing')
  return value
}

const zoom = 'object-cover transition duration-500 ease-out group-hover:scale-110'

export function ServiceGallery({
  children,
  images,
  labels,
}: {
  children: ReactNode
  images: ServiceSlide[]
  labels: { close: string; next: string; previous: string }
}) {
  const [index, setIndex] = useState<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  const titleId = useId()
  const current = index != null ? images[index] : null

  useEffect(() => {
    if (index == null) {
      wasOpen.current = false
      return
    }
    if (!wasOpen.current) closeRef.current?.focus()
    wasOpen.current = true
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIndex(null)
      if (event.key === 'ArrowRight') setIndex((value) => (value == null ? value : (value + 1) % images.length))
      if (event.key === 'ArrowLeft') {
        setIndex((value) => (value == null ? value : (value - 1 + images.length) % images.length))
      }
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [images.length, index])

  return (
    <GalleryContext.Provider value={{ images, open: setIndex }}>
      {children}
      {current && index != null
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b4b]/85 p-4 sm:p-8">
              <button
                type="button"
                className="absolute inset-0 cursor-pointer"
                aria-label={labels.close}
                onClick={() => setIndex(null)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative flex w-full max-w-5xl flex-col items-center"
              >
                <h2 id={titleId} className="sr-only">
                  {current.alt}
                </h2>
                <button
                  ref={closeRef}
                  type="button"
                  className="absolute top-3 right-3 z-10 inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  aria-label={labels.close}
                  onClick={() => setIndex(null)}
                >
                  <X className="size-5" aria-hidden />
                </button>
                <div className="relative h-[min(78vh,42rem)] w-full">
                  <Image
                    src={current.src}
                    alt={current.alt}
                    fill
                    sizes="90vw"
                    className="object-contain"
                  />
                </div>
                <p className="mt-4 text-sm font-semibold text-white">
                  {index + 1} / {images.length}
                </p>
                {images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      className="absolute top-1/2 left-0 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:-left-5"
                      aria-label={labels.previous}
                      onClick={() => setIndex((value) => (value == null ? value : (value - 1 + images.length) % images.length))}
                    >
                      <ChevronLeft className="size-6" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="absolute top-1/2 right-0 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:-right-5"
                      aria-label={labels.next}
                      onClick={() => setIndex((value) => (value == null ? value : (value + 1) % images.length))}
                    >
                      <ChevronRight className="size-6" aria-hidden />
                    </button>
                  </>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </GalleryContext.Provider>
  )
}

export function ServiceHeroPhoto() {
  const { images, open } = useGallery()
  const image = images[0]
  if (!image) return null
  return (
    <button
      type="button"
      className="group block w-full cursor-pointer overflow-hidden rounded-3xl bg-canvas text-left"
      aria-label={image.alt}
      onClick={() => open(0)}
    >
      <Image
        src={image.src}
        alt=""
        width={1200}
        height={760}
        priority
        className={`aspect-[16/10] w-full ${zoom}`}
      />
    </button>
  )
}

export function ServicePhotoStrip() {
  const { images, open } = useGallery()
  const thumbs = images.length > 1 ? images.slice(1) : images
  return (
    <div className="grid grid-cols-3 gap-3">
      {thumbs.map((image, index) => {
        const slideIndex = images.length > 1 ? index + 1 : 0
        return (
          <button
            key={`${image.src}-${slideIndex}`}
            type="button"
            className="group cursor-pointer overflow-hidden rounded-2xl bg-canvas"
            aria-label={image.alt}
            onClick={() => open(slideIndex)}
          >
            <Image
              src={image.src}
              alt=""
              width={360}
              height={240}
              className={`aspect-[4/3] w-full ${zoom}`}
            />
          </button>
        )
      })}
    </div>
  )
}
