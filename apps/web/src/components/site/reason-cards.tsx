'use client'

import Image from 'next/image'

import { ScrollReveal } from '@/components/site/scroll-reveal'

const images = [
  '/Reservation simplifiee au bureau-1.png',
  '/Soumission transparente sur ordinateur-2.png',
  '/plusieurs-services-un-seul-contact-3.png',
]

type ReasonCardsProps = {
  items: { title: string; text: string }[]
}

export function ReasonCards({ items }: ReasonCardsProps) {
  return (
    <ul className="ngw-card-grid gap-4">
      {items.map((item, index) => {
        const image = images[index] ?? images[0]
        const stepLabel = String(index + 1).padStart(2, '0')
        return (
          <ScrollReveal key={item.title} as="li">
            <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(7,27,75,0.14)]">
              <div className="relative aspect-[2/1] overflow-hidden sm:aspect-[16/10]">
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="object-cover object-[center_35%] transition duration-500 ease-out group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-navy/35 via-transparent to-transparent" aria-hidden />
                <span className="absolute top-3 left-3 inline-flex size-9 items-center justify-center rounded-full bg-white/95 text-xs font-bold tracking-wide text-[#1e2b6e] ring-1 ring-navy/10">
                  {stepLabel}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h3 className="text-lg font-bold tracking-tight text-[#1e2b6e]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-navy/70">{item.text}</p>
              </div>
            </article>
          </ScrollReveal>
        )
      })}
    </ul>
  )
}
