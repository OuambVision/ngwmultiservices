'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

const images = [
  '/Reservation simplifiee au bureau-1.png',
  '/Soumission transparente sur ordinateur-2.png',
  '/Plusieurs services, un seul contact-3.png',
]

type ReasonCardsProps = {
  items: { title: string; text: string }[]
}

export function ReasonCards({ items }: ReasonCardsProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setShown(true)
        observer.disconnect()
      },
      { threshold: 0.35 },
    )
    observer.observe(list)
    return () => observer.disconnect()
  }, [])

  return (
    <ul ref={listRef} className="grid gap-5 md:grid-cols-3">
      {items.map((item, index) => {
        const image = images[index] ?? images[0]
        return (
          <li key={item.title}>
            <article
              className={cn(
                'relative flex h-full min-h-[21rem] flex-col justify-end overflow-hidden rounded-2xl bg-white p-6 shadow-[0_16px_36px_-24px_rgba(7,27,75,0.55)] ring-1 ring-navy/10 transition duration-700 ease-out sm:p-7',
                shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
                'hover:-translate-y-1.5 hover:shadow-lg',
              )}
              style={{ transitionDelay: shown ? `${index * 160}ms` : '0ms' }}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="(min-width: 768px) 30vw, 100vw"
                className="object-cover object-[center_35%] brightness-[0.86]"
              />
              <div aria-hidden className="absolute inset-0 bg-navy/20" />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-white from-16% via-white/80 via-38% to-transparent"
              />
              <div className="relative">
                <h3 className="text-xl font-semibold tracking-tight text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-navy/75">{item.text}</p>
              </div>
            </article>
          </li>
        )
      })}
    </ul>
  )
}
