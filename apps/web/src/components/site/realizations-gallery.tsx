'use client'

import { ArrowRight, BadgeCheck, Building2, Calendar, Camera, Car, CircleCheck, Home, MapPin, Sparkles, Users, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { reservationHref } from '@/config/site'

export type RealizationCard = {
  categorySlug: string
  categoryTitle: string
  id: number
  image: string
  imageAlt: string
  slug: string
  summary: string
  title: string
}

const familyOrder = ['automobile', 'residentiel', 'commercial', 'specialise'] as const

const badgeIconClass: Record<string, string> = {
  automobile: 'bg-accent text-white',
  commercial: 'bg-action text-white',
  residentiel: 'bg-action text-white',
  specialise: 'bg-highlight text-[#071b4b]',
}

const badgeIcon: Record<string, LucideIcon> = {
  automobile: Car,
  commercial: Building2,
  residentiel: Home,
  specialise: Sparkles,
}

const badgeLabel: Record<string, string> = {
  automobile: 'projects.labelAutomobile',
  commercial: 'projects.labelCommercial',
  residentiel: 'projects.labelResidentiel',
  specialise: 'projects.labelSpecialise',
}

export function RealizationsGallery({
  cards,
  categories,
}: {
  cards: RealizationCard[]
  categories: Array<{ slug: string; title: string }>
}) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('tous')
  const ordered = useMemo(
    () => [...categories].sort((a, b) => familyOrder.indexOf(a.slug as (typeof familyOrder)[number]) - familyOrder.indexOf(b.slug as (typeof familyOrder)[number])),
    [categories],
  )
  const visible = filter === 'tous' ? cards : cards.filter((card) => card.categorySlug === filter)

  return (
    <div className="bg-canvas">
      <div className="mx-auto w-full max-w-[90rem] px-4 pt-10 pb-16 sm:px-6 lg:pt-14 lg:pb-24">
        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-navy/70 uppercase">
              <span className="h-2 w-12 rounded-full bg-highlight" aria-hidden />
              {t('projects.eyebrow')}
            </p>
            <h1 className="mt-3 text-xl font-bold tracking-tight text-[#1e2b6e] sm:text-4xl lg:text-5xl">{t('projects.title')}</h1>
            <p className="mt-3 max-w-xl text-navy/70">{t('projects.text')}</p>
          </div>
          <ul className="grid gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy/10 sm:grid-cols-3 lg:min-w-[34rem]">
            {[
              [BadgeCheck, t('projects.quality'), t('projects.qualityText')],
              [Camera, t('projects.real'), t('projects.realText')],
              [Users, t('projects.clients'), t('projects.clientsText')],
            ].map(([Icon, title, text]) => {
              const Mark = Icon as LucideIcon
              return (
                <li key={String(title)} className="flex items-start gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-action">
                    <Mark className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-[#1e2b6e]">{String(title)}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-navy/60">{String(text)}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label={t('projects.title')}>
          <FilterButton active={filter === 'tous'} label={t('projects.all')} onClick={() => setFilter('tous')} />
          {ordered.map((category) => (
            <FilterButton
              key={category.slug}
              active={filter === category.slug}
              label={category.title}
              onClick={() => setFilter(category.slug)}
            />
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="mt-8 rounded-2xl bg-white px-5 py-8 text-sm text-navy/60 ring-1 ring-navy/10">{t('projects.empty')}</p>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {visible.map((card) => {
              const Icon = badgeIcon[card.categorySlug] ?? Sparkles
              return (
                <li key={card.id}>
                  <Link
                    href={`/realisations/${card.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/10"
                  >
                    <span className="relative block aspect-[16/10] overflow-hidden">
                      <Image
                        src={card.image}
                        alt={card.imageAlt}
                        fill
                        sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
                        className="object-cover transition duration-500 ease-out group-hover:scale-110"
                      />
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white py-1 pr-3 pl-1 text-sm font-semibold text-[#1e2b6e] shadow-md">
                        <span className={`inline-flex size-7 items-center justify-center rounded-lg ${badgeIconClass[card.categorySlug] ?? 'bg-navy text-white'}`}>
                          <Icon className="size-4" aria-hidden />
                        </span>
                        {t(badgeLabel[card.categorySlug] ?? 'projects.labelSpecialise')}
                      </span>
                    </span>
                    <span className="flex flex-1 items-start gap-3 p-4">
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-[#1e2b6e]">{card.title}</span>
                        {card.summary ? <span className="mt-1 block text-sm leading-5 text-navy/60">{card.summary}</span> : null}
                      </span>
                      <ArrowRight className="mt-0.5 size-4 shrink-0 text-navy/35 transition group-hover:text-action" aria-hidden />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        <section className="mt-12 flex flex-col gap-6 rounded-3xl border border-navy/10 bg-white px-6 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.16em] text-navy/60 uppercase">
              <span className="h-2 w-12 rounded-full bg-highlight" aria-hidden />
              {t('projects.ctaEyebrow')}
            </p>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-[#1e2b6e] sm:text-3xl lg:text-4xl">
              {t('projects.ctaTitle')} <span className="text-accent">{t('projects.ctaAccent')}</span> {t('projects.ctaEnd')}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-navy/70">{t('projects.ctaText')}</p>
          </div>
          <div className="flex flex-col items-start gap-4">
            <Link
              href={reservationHref}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-[#c81d22]"
            >
              <Calendar className="size-4" aria-hidden />
              {t('projects.ctaAction')}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-[#1e2b6e]">
              {[
                ['broom', t('projects.professional')],
                ['check', t('projects.careful')],
                ['pin', t('projects.area')],
              ].map(([kind, label]) => (
                <li key={String(label)} className="inline-flex items-center gap-1.5">
                  {kind === 'broom' ? <BroomIcon className="size-4 text-[#1e2b6e]" /> : null}
                  {kind === 'check' ? <CircleCheck className="size-4 text-[#1e2b6e]" aria-hidden /> : null}
                  {kind === 'pin' ? <MapPin className="size-4 text-[#1e2b6e]" aria-hidden /> : null}
                  {String(label)}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

function BroomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 3 8.5 14" />
      <path d="m5 16.5 11-4" />
      <path d="m4.5 19 11-4" />
      <path d="m4 21.5 11-4" />
    </svg>
  )
}

function FilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold ${
        active ? 'bg-action text-white' : 'bg-white text-navy ring-1 ring-navy/15 hover:ring-action'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
