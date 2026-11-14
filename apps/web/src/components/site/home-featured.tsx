import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, Tag } from 'lucide-react'

import type { getT } from '@/i18n/server'

import { ServiceRating } from './service-rating'

const familyLabel: Record<string, string> = {
  automobile: 'families.automotive',
  commercial: 'families.commercial',
  residentiel: 'families.residential',
  specialise: 'families.specialized',
}

export type FeaturedService = {
  average: number
  categorySlug: string
  count: number
  duration: string
  href: string
  id: number
  imageAlt: string
  imageSrc: string
  order: number
  price: string
  slug: string
  summary: string
  title: string
}

export function HomeFeatured({
  services,
  t,
}: {
  services: FeaturedService[]
  t: Awaited<ReturnType<typeof getT>>
}) {
  if (services.length === 0) return null
  return (
    <section className="bg-white" aria-labelledby="services-phares-titre">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-16 sm:px-6 lg:py-24">
        <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-navy/70 uppercase">
          <span className="h-2 w-12 rounded-full bg-highlight" aria-hidden />
          {t('home.featuredEyebrow')}
        </p>
        <h2 id="services-phares-titre" className="mt-3 text-4xl font-bold tracking-tight text-[#1e2b6e] sm:text-5xl">
          {t('home.featuredTitle')}
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-navy/70">{t('home.featuredText')}</p>
        <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <li key={service.id}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-canvas shadow-sm ring-1 ring-navy/10">
                <Link href={service.href} className="absolute inset-0 z-0" aria-label={service.title} />
                <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={service.imageSrc}
                      alt={service.imageAlt}
                      fill
                      sizes="(min-width: 1280px) 24rem, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition duration-500 ease-out group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#1e2b6e]">
                      {t(familyLabel[service.categorySlug] ?? 'families.specialized')}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-lg font-bold tracking-tight text-[#0c45b0]">{service.title}</h3>
                    <ServiceRating
                      average={service.average}
                      count={service.count}
                      href={`/avis?service=${service.slug}`}
                      size="sm"
                      className="pointer-events-auto relative z-10 mt-2"
                    />
                    {service.summary ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-navy/65">{service.summary}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-navy/75">
                      {service.duration ? (
                        <p className="inline-flex items-center gap-1.5">
                          <Clock className="size-4 text-action" aria-hidden />
                          {service.duration}
                        </p>
                      ) : null}
                      {service.price ? (
                        <p className="inline-flex items-center gap-1.5 font-medium text-navy">
                          <Tag className="size-4 text-action" aria-hidden />
                          {t('services.fromPrice', { price: service.price })}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-full bg-action px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0544c4]"
          >
            {t('home.featuredAll')}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
