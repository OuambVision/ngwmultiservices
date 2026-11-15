'use client'

import { Building2, Car, Check, Home, Package, ShieldCheck, Wrench, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { NgwCategoryName, OrbitCategoryCards } from '@/data/ngw-service-catalog'
import type { ServiceScore } from '@/lib/reviews'
import { cn } from '@/lib/utils'

import { ServiceRating } from '@/components/site/service-rating'

const CATEGORY_ICONS: Record<NgwCategoryName, { icon: LucideIcon; tile: string }> = {
  NGW_Automotive: { icon: Car, tile: 'bg-accent text-white' },
  NGW_Commercial: { icon: Building2, tile: 'bg-action text-white' },
  NGW_Residential: { icon: Home, tile: 'bg-action text-white' },
  NGW_Specialized: { icon: ShieldCheck, tile: 'bg-highlight text-navy' },
  NGW_Demenagement: { icon: Package, tile: 'bg-navy text-white' },
  NGW_PetiteMaintenance: { icon: Wrench, tile: 'bg-action text-white' },
}

export function CategoryServiceCard({
  name,
  cards,
  ratings = {},
}: {
  name: string | null
  cards: OrbitCategoryCards
  ratings?: Record<string, ServiceScore>
}) {
  const { i18n } = useTranslation()
  const [shown, setShown] = useState<string | null>(name)
  const [holding, setHolding] = useState(false)
  const releaseTimer = useRef<number | null>(null)

  const holdCard = () => {
    if (releaseTimer.current) window.clearTimeout(releaseTimer.current)
    setHolding(true)
  }

  const releaseCard = () => {
    if (releaseTimer.current) window.clearTimeout(releaseTimer.current)
    releaseTimer.current = window.setTimeout(() => setHolding(false), 160)
  }

  useEffect(() => {
    if (name) {
      setShown(name)
      return
    }
    if (holding) return
    const timeout = window.setTimeout(() => setShown(null), 180)
    return () => window.clearTimeout(timeout)
  }, [holding, name])

  const card =
    shown && shown in cards ? cards[shown as NgwCategoryName] ?? null : null
  const visual = shown && shown in CATEGORY_ICONS ? CATEGORY_ICONS[shown as NgwCategoryName] : null
  const Icon = visual?.icon
  const wide = (card?.services.length ?? 0) > 6
  const countLabel =
    card == null
      ? ''
      : i18n.language.startsWith('en')
        ? `${card.services.length} services`
        : `${card.services.length} prestations`

  return (
    <div
      className={cn(
        'pointer-events-none absolute top-1/2 left-1/2 z-10 w-[min(26rem,calc(100%-1.25rem))] -translate-x-1/2 -translate-y-1/2 transition duration-300 ease-out',
        wide ? 'sm:w-[min(34rem,calc(100%-1.5rem))]' : 'sm:w-[min(24rem,calc(100%-1.5rem))]',
        card ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
      )}
      aria-live="polite"
    >
      {card && Icon ? (
        <article className="overflow-hidden rounded-2xl bg-white/94 shadow-[0_22px_50px_rgba(7,27,75,0.32)] ring-1 ring-white backdrop-blur-md">
          <div className="h-1 bg-gradient-to-r from-action via-highlight to-accent" />
          <div className="px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl',
                  visual.tile,
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-action uppercase">
                  <span className="h-0.5 w-5 shrink-0 bg-highlight" aria-hidden />
                  {card.eyebrow}
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-navy sm:text-xl">
                  <Link
                    href={card.href}
                    className="pointer-events-auto cursor-pointer rounded-sm hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                    onMouseEnter={holdCard}
                    onMouseLeave={releaseCard}
                  >
                    {card.title}
                  </Link>
                </h3>
                <p className="text-xs text-navy/55">{countLabel}</p>
              </div>
            </div>
            <ul
              className={cn(
                'mt-3 grid gap-x-5',
                wide ? 'grid-cols-2 gap-y-1' : 'grid-cols-1 gap-y-0.5',
              )}
            >
              {card.services.map((service) => {
                const slug = service.href.split('/').filter(Boolean).pop() ?? ''
                const score = ratings[slug]
                return (
                  <li key={service.href} className="flex items-center gap-2">
                    <Link
                      href={service.href}
                      className="pointer-events-auto flex min-w-0 flex-1 cursor-pointer gap-2 rounded-md py-1 text-sm leading-5 text-navy/80 hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                      onMouseEnter={holdCard}
                      onMouseLeave={releaseCard}
                    >
                      <Check className="mt-0.5 size-3.5 shrink-0 text-action" aria-hidden />
                      <span className="truncate">{service.label}</span>
                    </Link>
                    {score ? (
                      <span className="pointer-events-auto shrink-0" onMouseEnter={holdCard} onMouseLeave={releaseCard}>
                        <ServiceRating
                          average={score.average}
                          count={score.count}
                          href={`/avis?service=${slug}`}
                          size="xs"
                        />
                      </span>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        </article>
      ) : null}
    </div>
  )
}
