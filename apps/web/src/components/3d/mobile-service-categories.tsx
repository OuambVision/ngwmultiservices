'use client'

import { ArrowRight, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import { ScrollReveal } from '@/components/site/scroll-reveal'
import { ServiceRating } from '@/components/site/service-rating'
import {
  getCategoryCard,
  NGW_CATEGORY_ORDER,
  type NgwCategoryName,
} from '@/data/ngw-service-catalog'
import type { ServiceScore } from '@/lib/reviews'

const CATEGORY_IMAGES: Record<Exclude<NgwCategoryName, 'NGW_AllServices'>, string> = {
  NGW_Automotive: '/3d/services/nettoyage-auto.png',
  NGW_Commercial: '/3d/services/nettoyage-commercial.png',
  NGW_Residential: '/3d/services/nettoyage-residentiel.png',
  NGW_Specialized: '/3d/services/nettoyage-specialise.png',
}

const MOBILE_CATEGORIES = NGW_CATEGORY_ORDER.filter(
  (name): name is Exclude<NgwCategoryName, 'NGW_AllServices'> => name !== 'NGW_AllServices',
)

function MobileCategoryCard({
  name,
  ratings,
}: {
  name: Exclude<NgwCategoryName, 'NGW_AllServices'>
  ratings: Record<string, ServiceScore>
}) {
  const { i18n, t } = useTranslation()
  const card = getCategoryCard(name, i18n.language)
  const imageSrc = CATEGORY_IMAGES[name]
  if (!card || !imageSrc) return null

  const countLabel = i18n.language.startsWith('en')
    ? `${card.services.length} services`
    : `${card.services.length} prestations`

  return (
    <ScrollReveal as="li">
      <article className="overflow-hidden rounded-3xl bg-white shadow-[0_18px_42px_rgba(7,27,75,0.28)] ring-1 ring-white/90">
        <Link
          href={card.href}
          className="group relative block aspect-[16/9] overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
        >
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 24rem"
            className="object-cover transition duration-500 ease-out group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/35 to-navy/10" aria-hidden />
          <span className="absolute inset-x-0 bottom-0 p-4">
            <span className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-highlight uppercase">
              <span className="h-0.5 w-5 shrink-0 bg-highlight" aria-hidden />
              {card.eyebrow}
            </span>
            <span className="mt-1 block text-xl font-semibold tracking-tight text-white">
              {card.title}
            </span>
            <span className="mt-1 block text-xs text-white/75">{countLabel}</span>
          </span>
        </Link>

        <ul className="divide-y divide-navy/10 px-3 py-1">
          {card.services.map((service) => {
            const slug = service.href.split('/').filter(Boolean).pop() ?? ''
            const score = ratings[slug]
            return (
              <li key={service.href}>
                <div className="flex items-center gap-2 py-2.5">
                  <Link
                    href={service.href}
                    className="flex min-w-0 flex-1 items-start gap-2.5 rounded-lg px-1 py-0.5 text-sm leading-5 text-navy/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                  >
                    <Check className="mt-0.5 size-3.5 shrink-0 text-action" aria-hidden />
                    <span className="min-w-0">{service.label}</span>
                  </Link>
                  {score ? (
                    <ServiceRating
                      average={score.average}
                      count={score.count}
                      href={`/avis?service=${slug}`}
                      size="xs"
                      className="shrink-0"
                    />
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>

        <div className="border-t border-navy/10 px-3 py-3">
          <Link
            href={card.href}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-canvas px-3 py-2.5 text-sm font-semibold text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
          >
            {t('services.viewFamily')}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </article>
    </ScrollReveal>
  )
}

export function MobileServiceCategories({
  ratings = {},
}: {
  ratings?: Record<string, ServiceScore>
}) {
  return (
    <ul className="flex flex-col gap-5 px-5 pb-2 sm:px-6 lg:hidden">
      {MOBILE_CATEGORIES.map((name) => (
        <MobileCategoryCard key={name} name={name} ratings={ratings} />
      ))}
    </ul>
  )
}
