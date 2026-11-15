'use client'

import {
  Building2,
  Car,
  Check,
  ChevronDown,
  Home,
  Package,
  Shield,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

const categoryIcons: Record<string, LucideIcon> = {
  automobile: Car,
  residentiel: Home,
  commercial: Building2,
  specialise: Shield,
  demenagement: Package,
  'petite-maintenance': Wrench,
}

const shortCategoryLabel: Record<string, string> = {
  automobile: 'families.automotive',
  residentiel: 'families.residential',
  commercial: 'families.commercial',
  specialise: 'families.specialized',
  demenagement: 'families.moving',
  'petite-maintenance': 'families.maintenance',
}

export type MobileCategoryOption = {
  id: number
  slug: string
  title: string
}

export function MobileCategorySelect({
  categories,
  currentSlug,
}: {
  categories: MobileCategoryOption[]
  currentSlug: string
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const current = categories.find((item) => item.slug === currentSlug) ?? categories[0]
  const CurrentIcon = (current?.slug && categoryIcons[current.slug]) || Shield
  const currentLabel =
    current?.slug && shortCategoryLabel[current.slug]
      ? t(shortCategoryLabel[current.slug])
      : (current?.title ?? t('services.categories'))

  useEffect(() => {
    setOpen(false)
  }, [currentSlug])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className="sticky top-[3.5rem] z-30 -mx-4 mb-5 border-b border-navy/10 bg-canvas/95 px-4 py-2.5 backdrop-blur-md sm:top-[4.75rem] sm:-mx-6 sm:px-6 lg:hidden"
    >
      <p className="mb-1.5 text-[11px] font-semibold tracking-[0.14em] text-navy/55 uppercase">
        {t('services.categories')}
      </p>
      <div className="relative">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          className="flex w-full items-center gap-3 rounded-xl bg-white px-3.5 py-3 text-left shadow-sm ring-1 ring-navy/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
            <CurrentIcon className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-[#1e2b6e]">{currentLabel}</span>
            <span className="block truncate text-xs text-navy/55">{current?.title}</span>
          </span>
          <ChevronDown
            className={cn('size-4 shrink-0 text-navy/50 transition duration-200', open && 'rotate-180')}
            aria-hidden
          />
        </button>

        {open ? (
          <ul
            id={listId}
            role="listbox"
            aria-label={t('services.categories')}
            className="absolute inset-x-0 top-[calc(100%+0.4rem)] z-40 overflow-hidden rounded-xl bg-white shadow-[0_18px_40px_rgba(7,27,75,0.18)] ring-1 ring-navy/10"
          >
            {categories.map((item) => {
              const active = item.slug === currentSlug
              const Icon = categoryIcons[item.slug] || Shield
              const label = shortCategoryLabel[item.slug]
                ? t(shortCategoryLabel[item.slug])
                : item.title
              return (
                <li key={item.id} role="option" aria-selected={active}>
                  <Link
                    href={`/services/${item.slug}`}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-3 text-sm transition',
                      active ? 'bg-accent/8 font-semibold text-accent' : 'text-navy hover:bg-canvas',
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <span
                      className={cn(
                        'inline-flex size-9 shrink-0 items-center justify-center rounded-lg',
                        active ? 'bg-accent text-white' : 'bg-canvas text-navy',
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{label}</span>
                      <span className="block truncate text-xs text-navy/55">{item.title}</span>
                    </span>
                    {active ? <Check className="size-4 shrink-0 text-accent" aria-hidden /> : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
