import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  Building2,
  Calendar,
  Car,
  Check,
  Clock,
  Home,
  Map,
  MapPin,
  Shield,
  type LucideIcon,
} from 'lucide-react'

import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { ServiceGallery, ServiceHeroPhoto, ServicePhotoStrip } from '@/components/site/service-gallery'
import { ServiceRating, StarRow } from '@/components/site/service-rating'
import { reservationHrefFor } from '@/config/site'
import { getLocale, getT } from '@/i18n/server'
import {
  categoryOf,
  formatPrice,
  loadService,
  richTextParagraphs,
  serviceSlides,
} from '@/lib/catalog'
import { loadReviewCards } from '@/lib/reviews'

const categoryIcons: Record<string, LucideIcon> = {
  automobile: Car,
  residentiel: Home,
  commercial: Building2,
  specialise: Shield,
}

type PageProps = {
  params: Promise<{ service: string; slug: string }>
}

function includedParts(item: string) {
  const [title, ...rest] = item.split(/\s+[—–-]\s+/)
  const detail = rest.join(' — ').trim()
  return {
    title: title?.trim() ?? item,
    detail: detail ? detail.charAt(0).toUpperCase() + detail.slice(1) : '',
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug, slug } = await params
  const service = await loadService(serviceSlug)
  const category = service ? categoryOf(service) : null
  if (!service || category?.slug !== slug) return { title: 'Services' }
  return { title: service.title }
}

export default async function ServicePage({ params }: PageProps) {
  const { service: serviceSlug, slug } = await params
  const t = await getT()
  const locale = await getLocale()
  const service = await loadService(serviceSlug)
  const category = service ? categoryOf(service) : null
  if (!service || !category || category.slug !== slug || !service.slug) notFound()

  const reviews = (await loadReviewCards()).filter((review) => review.serviceId === service.id)
  const score =
    reviews.length > 0
      ? { average: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length, count: reviews.length }
      : null
  const slides = serviceSlides(service)
  const price = typeof service.priceFrom === 'number' ? formatPrice(service.priceFrom, locale) : null
  const paragraphs = richTextParagraphs(service.description)
  const description = paragraphs.length > 0 ? paragraphs : service.summary ? [service.summary] : []
  const included = (service.included ?? []).flatMap((row) => (row.item ? [includedParts(row.item)] : []))
  const CategoryIcon = (category.slug && categoryIcons[category.slug]) || Car
  const facts = [
    service.duration
      ? { icon: Clock, label: t('services.durationEstimate'), value: service.duration }
      : null,
    service.place ? { icon: MapPin, label: t('services.place'), value: service.place } : null,
    service.zone ? { icon: Map, label: t('services.zoneServed'), value: service.zone } : null,
  ].filter((fact): fact is { icon: LucideIcon; label: string; value: string } => fact != null)

  return (
    <article className="mx-auto w-full max-w-[90rem] px-4 pt-8 pb-20 sm:px-6 lg:pt-10 lg:pb-28">
      <Breadcrumbs
        label={t('services.breadcrumb')}
        items={[
          { href: '/', label: t('nav.home') },
          { href: '/services', label: t('nav.services') },
          { href: `/services/${category.slug}`, label: category.title },
          { label: service.title },
        ]}
      />

      <ServiceGallery
        images={slides}
        labels={{
          close: t('services.closeGallery'),
          next: t('services.nextPhoto'),
          previous: t('services.previousPhoto'),
        }}
      >
      <div className="mt-6 grid items-start gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.82fr)]">
        <ServiceHeroPhoto />

        {included.length > 0 ? (
          <aside className="rounded-3xl bg-white p-5 ring-1 ring-navy/10 sm:p-6" aria-labelledby="service-included">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                <CategoryIcon className="size-5" aria-hidden />
              </span>
              <h2 id="service-included" className="text-lg font-bold text-[#24306a]">
                {t('services.included')} :
              </h2>
            </div>
            <ul className="mt-5 space-y-4">
              {included.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <Check className="mt-0.5 size-7 shrink-0 text-[#0057ff]" strokeWidth={3} aria-hidden />
                  <span>
                    <span className="block text-sm font-bold text-[#24306a]">{item.title}</span>
                    {item.detail ? <span className="mt-0.5 block text-sm text-navy/55">{item.detail}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        ) : (
          <div className="hidden lg:block" />
        )}

        <div className="grid items-start gap-8 lg:col-span-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)]">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#1e2b6e]">{service.title}</h1>
            {score ? (
              <ServiceRating
                average={score.average}
                count={score.count}
                href={`/avis?service=${service.slug}`}
                size="md"
                className="mt-3"
              />
            ) : (
              <Link href={`/avis?service=${service.slug}`} className="mt-3 inline-flex text-sm font-semibold text-action hover:underline">
                {t('services.noReviews')}
              </Link>
            )}
            <span className="mt-2 block h-1 w-16 rounded-full bg-highlight" aria-hidden />
            {description.length > 0 ? (
              <div className="mt-4 max-w-2xl space-y-3 text-[15px] leading-7 text-navy/70">
                {description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : null}
            {price ? (
              <p className="mt-5">
                <span className="text-lg font-bold text-[#1e2b6e]">{t('services.from')}</span>{' '}
                <span className="text-4xl font-extrabold tracking-tight text-accent">{price}</span>
              </p>
            ) : null}
            <Link
              href={reservationHrefFor(service.slug)}
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-action px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#0544c4] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              <Calendar className="size-4" aria-hidden />
              {t('services.reserveThis')}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <ServicePhotoStrip />
        </div>

        {facts.length > 0 ? (
          <dl className="flex flex-col divide-y divide-navy/10 overflow-hidden rounded-2xl border border-navy/10 bg-white sm:flex-row sm:divide-x sm:divide-y-0 lg:col-span-2">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-1 items-center gap-4 px-6 py-5">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-[#eef2fb] text-[#24306a]">
                  <fact.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <dt className="text-sm font-bold text-[#1e2b6e]">{fact.label}</dt>
                  <dd className="mt-0.5 text-sm text-navy/60">{fact.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        ) : null}

        {reviews.length > 0 ? (
          <section className="lg:col-span-2" aria-labelledby="service-reviews">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="service-reviews" className="text-2xl font-bold text-[#1e2b6e]">
                {t('services.reviewsTitle')}
              </h2>
              <Link href={`/avis?service=${service.slug}`} className="text-sm font-semibold text-action hover:underline">
                {t('services.seeReviews')}
              </Link>
            </div>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {reviews.slice(0, 2).map((review) => (
                <li key={review.id} className="rounded-2xl bg-white p-4 ring-1 ring-navy/10">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-[#1e2b6e]">{review.author}</span>
                    <span className="text-xs text-navy/50">{review.date}</span>
                  </div>
                  <div className="mt-2">
                    <StarRow label={`${review.rating} / 5`} size="sm" value={review.rating} />
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-navy/70">{review.text}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
      </ServiceGallery>
    </article>
  )
}
