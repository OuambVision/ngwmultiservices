import Image from 'next/image'
import Link from 'next/link'
import {
  Building2,
  Calendar,
  Car,
  ChevronRight,
  Clock,
  Home,
  MapPin,
  MessageCircle,
  Shield,
  Sparkles,
  Tag,
  type LucideIcon,
} from 'lucide-react'

import { quoteHref, reservationHrefFor } from '@/config/site'
import type { getT } from '@/i18n/server'
import { categoryImage, formatPrice, serviceImage } from '@/lib/catalog'
import type { ServiceScore } from '@/lib/reviews'
import type { Category, Service } from '@repo/types'

import { ServiceRating } from './service-rating'

const categoryIcons: Record<string, LucideIcon> = {
  automobile: Car,
  residentiel: Home,
  commercial: Building2,
  specialise: Shield,
}

function splitTitle(title: string) {
  const [first, ...rest] = title.trim().split(/\s+/)
  return { first: first ?? title, rest: rest.join(' ') }
}

export function CategoryCatalog({
  categories,
  category,
  locale,
  ratings,
  services,
  t,
}: {
  categories: Category[]
  category: Category
  locale: string
  ratings: Record<number, ServiceScore>
  services: Service[]
  t: Awaited<ReturnType<typeof getT>>
}) {
  const hero = categoryImage(category)
  const title = splitTitle(category.title)
  const QuoteIcon = (category.slug && categoryIcons[category.slug]) || Car
  const assurances = [
    {
      icon: Sparkles,
      title: t('services.assuranceProducts'),
      text: t('services.assuranceProductsText'),
      className: 'bg-accent/10 text-accent',
    },
    {
      icon: Shield,
      title: t('services.assuranceReliable'),
      text: t('services.assuranceReliableText'),
      className: 'bg-action/10 text-action',
    },
    {
      icon: MapPin,
      title: t('services.assuranceArea'),
      text: t('services.assuranceAreaText'),
      className: 'bg-highlight/15 text-[#b8860b]',
    },
    {
      icon: Clock,
      title: t('services.assuranceBooking'),
      text: t('services.assuranceBookingText'),
      className: 'bg-action/10 text-action',
    },
  ]

  return (
    <>
      <section className="relative isolate flex min-h-[16.5rem] items-center overflow-hidden bg-navy text-white lg:min-h-[18.5rem]">
        {hero ? (
          <Image
            src={hero.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_center]"
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(7,27,75,0.94)_0%,rgba(7,27,75,0.82)_100%)] lg:bg-[linear-gradient(90deg,#071b4b_0%,rgba(7,27,75,0.96)_28%,rgba(7,27,75,0.78)_46%,rgba(7,27,75,0.28)_68%,rgba(7,27,75,0.05)_100%)]"
        />
        <div className="relative z-10 mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-6 lg:py-10">
          <nav aria-label={t('services.breadcrumb')}>
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/75">
              <li>
                <Link
                  href="/"
                  className="inline-flex rounded-sm hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Home className="size-4" aria-hidden />
                  <span className="sr-only">{t('nav.home')}</span>
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {t('nav.services')}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" />
              </li>
              <li className="font-medium text-white" aria-current="page">
                {category.title}
              </li>
            </ol>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            <span className="text-white">{title.first}</span>
            {title.rest ? <span className="text-highlight"> {title.rest}</span> : null}
          </h1>
          {category.description ? (
            <p className="mt-3 max-w-xl text-base leading-7 text-white/85 sm:text-lg">{category.description}</p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid items-start gap-6 lg:grid-cols-[17.5rem_minmax(0,1fr)]">
          <div className="space-y-5">
            <nav aria-label={t('services.categories')} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-navy/10">
              <p className="px-3 pt-2 pb-3 text-sm font-semibold text-navy">{t('services.categories')}</p>
              <ul className="space-y-1.5">
                {categories.map((item) => {
                  const active = item.slug === category.slug
                  const Icon = (item.slug && categoryIcons[item.slug]) || Sparkles
                  return (
                    <li key={item.id}>
                      {item.slug ? (
                        <Link
                          href={`/services/${item.slug}`}
                          aria-current={active ? 'page' : undefined}
                          className={
                            active
                              ? 'flex cursor-pointer items-center gap-3 rounded-xl bg-accent px-3 py-3 text-sm font-semibold text-white'
                              : 'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-navy hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action'
                          }
                        >
                          <Icon className="size-4 shrink-0" aria-hidden />
                          <span className="min-w-0 flex-1 truncate">{item.title}</span>
                          <ChevronRight className="size-4 shrink-0" aria-hidden />
                        </Link>
                      ) : (
                        <span className="flex items-center gap-3 px-3 py-3 text-sm font-semibold text-navy">
                          {item.title}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </nav>

            <aside className="rounded-2xl bg-[#e7eefb] p-5 ring-1 ring-navy/5">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-white text-action shadow-sm">
                <QuoteIcon className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-navy">{t('services.quoteTitle')}</h2>
              <p className="mt-2 text-sm leading-6 text-navy/70">{t('services.quoteText')}</p>
              <Link
                href={quoteHref}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
              >
                <MessageCircle className="size-4 text-action" aria-hidden />
                {t('services.quoteAction')}
              </Link>
            </aside>
          </div>

          {services.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => {
                const image = serviceImage(service)
                const price = typeof service.priceFrom === 'number' ? formatPrice(service.priceFrom, locale) : null
                const sheet = service.slug ? `/services/${category.slug}/${service.slug}` : null
                return (
                  <li key={service.id}>
                    <article
                      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/10 ${sheet ? 'cursor-pointer' : ''}`}
                    >
                      {sheet ? (
                        <Link href={sheet} className="absolute inset-0 z-0" aria-label={service.title} />
                      ) : null}
                      <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
                        <div className="relative aspect-[12/5] overflow-hidden">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            sizes="(min-width: 1280px) 22rem, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition duration-500 ease-out group-hover:scale-110"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <h2 className="text-lg font-bold tracking-tight text-[#0c45b0]">{service.title}</h2>
                          {ratings[service.id] && service.slug ? (
                            <ServiceRating
                              average={ratings[service.id].average}
                              count={ratings[service.id].count}
                              href={`/avis?service=${service.slug}`}
                              size="sm"
                              className="pointer-events-auto relative z-10 mt-1.5"
                            />
                          ) : null}
                          {service.summary ? (
                            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-navy/65">{service.summary}</p>
                          ) : null}
                          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-navy/75">
                            {service.duration ? (
                              <p className="inline-flex items-center gap-1.5">
                                <Clock className="size-4 text-action" aria-hidden />
                                <span className="sr-only">{t('services.duration')}</span>
                                {service.duration}
                              </p>
                            ) : null}
                            {price ? (
                              <p className="inline-flex items-center gap-1.5 font-medium text-navy">
                                <Tag className="size-4 text-action" aria-hidden />
                                <span className="sr-only">{t('services.price')}</span>
                                {t('services.fromPrice', { price })}
                              </p>
                            ) : null}
                          </div>
                          {sheet ? (
                            <div className="pointer-events-auto mt-4 flex gap-2">
                              <Link
                                href={sheet}
                                className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-[#08275f] px-3 py-2.5 text-sm font-semibold text-[#08275f] transition duration-200 hover:-translate-y-0.5 hover:bg-[#08275f]/10 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                              >
                                {t('services.details')}
                              </Link>
                              <Link
                                href={reservationHrefFor(service.slug!)}
                                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-action px-3 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#0544c4] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                              >
                                <Calendar className="size-4" aria-hidden />
                                {t('services.reserve')}
                              </Link>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="rounded-2xl bg-white px-6 py-10 text-navy/70 ring-1 ring-navy/10">
              {t('services.emptyCategory')}
            </p>
          )}
        </div>
      </section>

      <section className="border-t border-navy/10" aria-label={t('services.assuranceReliable')}>
        <ul className="mx-auto grid w-full max-w-[90rem] gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:py-10">
          {assurances.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full ${item.className}`}>
                <item.icon className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold text-navy">{item.title}</span>
                <span className="mt-1 block text-sm leading-5 text-navy/65">{item.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
