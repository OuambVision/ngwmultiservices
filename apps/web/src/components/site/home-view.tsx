import { Calendar, FileText, Leaf, MapPin, Shield } from 'lucide-react'
import Link from 'next/link'

import { NgwOrbitPreview } from '@/components/3d/ngw-orbit-preview'
import { reservationHref, site } from '@/config/site'
import { getLocale, getT } from '@/i18n/server'
import { categoryOf, formatPrice, loadServices, serviceImage } from '@/lib/catalog'
import { pickTopRated } from '@/lib/featured'
import type { HomeContent } from '@/lib/home'
import { loadReviewCards, mixedReviews, scoresByService } from '@/lib/reviews'

import { HomeFeatured, type FeaturedService } from './home-featured'
import { HomeReviews } from './reviews-board'
import { HeroSlideshow } from './hero-slideshow'
import { ReasonCards } from './reason-cards'
import { ScrollReveal } from './scroll-reveal'
import { Section } from './section'

const highlightIcons = [
  { icon: Shield, labelKey: 'home.reliable' },
  { icon: Leaf, labelKey: 'home.products' },
] as const

function HeroTitle({ title }: { title: string }) {
  const parts = title.split(/\s:\s/)
  if (parts.length < 2) return title
  const accent = parts.pop()
  return (
    <>
      {parts.join(' : ')}
      {'\u00A0: '}
      <span className="text-highlight">{accent}</span>
    </>
  )
}

export async function HomeView({ content }: { content: HomeContent }) {
  const t = await getT()
  const locale = await getLocale()
  const highlights = highlightIcons.map((item) => ({ ...item, label: t(item.labelKey) }))
  const [reviewCards, services] = await Promise.all([loadReviewCards(), loadServices()])
  const reviews = mixedReviews(reviewCards)
  const scores = scoresByService(reviewCards)
  const ratings = scores.bySlug
  const featured: FeaturedService[] = pickTopRated(
    services.flatMap((service) => {
      const category = categoryOf(service)
      const score = scores.byId[service.id]
      if (!service.slug || !category?.slug || !score) return []
      const image = serviceImage(service)
      return [
        {
          average: score.average,
          categorySlug: category.slug,
          count: score.count,
          duration: service.duration ?? '',
          href: `/services/${category.slug}/${service.slug}`,
          id: service.id,
          imageAlt: image.alt,
          imageSrc: image.src,
          order: service.order ?? 0,
          price: typeof service.priceFrom === 'number' ? formatPrice(service.priceFrom, locale) : '',
          slug: service.slug,
          summary: service.summary ?? '',
          title: service.title,
        },
      ]
    }),
  )

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <HeroSlideshow images={content.heroImages} />
        <div
          aria-hidden
          className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(7,27,75,0.94)_0%,rgba(7,27,75,0.84)_42%,rgba(7,27,75,0.62)_100%)] lg:bg-[linear-gradient(90deg,rgba(7,27,75,0.96)_0%,rgba(7,27,75,0.9)_26%,rgba(7,27,75,0.62)_46%,rgba(7,27,75,0.22)_66%,transparent_82%)]"
        />
        <div className="relative z-10 mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:py-16">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-white/80 uppercase">
              <span className="h-0.5 w-8 shrink-0 bg-highlight" aria-hidden />
              {site.name}
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              <HeroTitle title={content.title} />
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/85">{content.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={reservationHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Calendar className="size-4" aria-hidden />
                {t('home.book')}
              </Link>
              <a
                href="#services-3d"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/70 px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <FileText className="size-4" aria-hidden />
                {t('home.explore')}
              </a>
            </div>
          </div>
          <ul className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-sm font-medium">
                <item.icon className="size-6 shrink-0" strokeWidth={1.75} aria-hidden />
                {item.label}
              </li>
            ))}
            <li className="flex items-center gap-3 text-sm font-medium">
              <MapPin className="size-6 shrink-0" strokeWidth={1.75} aria-hidden />
              {content.area}
            </li>
          </ul>
        </div>
      </section>

      <section id="pourquoi-ngw" className="scroll-mt-20 bg-canvas" aria-labelledby="pourquoi-ngw-titre">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
          <ScrollReveal>
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-navy/70 uppercase">
              <span className="h-2 w-12 rounded-full bg-highlight" aria-hidden />
              {t('home.reasonsEyebrow')}
            </p>
            <h2 id="pourquoi-ngw-titre" className="mt-3 text-xl font-bold tracking-tight text-[#1e2b6e] sm:text-4xl lg:text-5xl">
              {t('home.reasonsTitle')}
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-navy/70 sm:text-lg">{t('home.reasonsSubtitle')}</p>
          </ScrollReveal>
          <div className="mt-8">
            <ReasonCards
              items={[
                { title: t('home.reasonBookingTitle'), text: t('home.reasonBookingText') },
                { title: t('home.reasonQuoteTitle'), text: t('home.reasonQuoteText') },
                { title: t('home.reasonServicesTitle'), text: t('home.reasonServicesText') },
              ]}
            />
          </div>
        </div>
      </section>

      <Section
        id="services-3d"
        eyebrow={t('home.showcaseEyebrow')}
        title={t('home.showcaseTitle')}
        backgroundImage="/construction.png"
        bleed
      >
        <NgwOrbitPreview ratings={ratings} />
      </Section>

      <HomeFeatured services={featured} t={t} />
      <HomeReviews reviews={reviews} />
    </>
  )
}
