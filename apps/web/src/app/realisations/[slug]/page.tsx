import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Building2, Calendar, Car, Check, Home, Sparkles, type LucideIcon } from 'lucide-react'

import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { ServiceGallery, ServiceHeroPhoto, ServicePhotoStrip } from '@/components/site/service-gallery'
import { reservationHref } from '@/config/site'
import { getLocale, getT } from '@/i18n/server'
import { withLocale } from '@/i18n/locale'
import { serviceFallbackSrc } from '@/lib/catalog'
import { API_URL } from '@repo/api'
import type { Media, Realization } from '@repo/types'

const categoryFallbacks: Record<string, string> = {
  automobile: '/3d/services/nettoyage-auto.png',
  commercial: '/3d/services/nettoyage-commercial.png',
  residentiel: '/3d/services/nettoyage-residentiel.png',
  specialise: '/3d/services/nettoyage-specialise.png',
}

const badgeIcon: Record<string, LucideIcon> = {
  automobile: Car,
  commercial: Building2,
  residentiel: Home,
  specialise: Sparkles,
}

const badgeIconClass: Record<string, string> = {
  automobile: 'bg-accent text-white',
  commercial: 'bg-action text-white',
  residentiel: 'bg-action text-white',
  specialise: 'bg-highlight text-[#071b4b]',
}

const badgeLabel: Record<string, string> = {
  automobile: 'projects.labelAutomobile',
  commercial: 'projects.labelCommercial',
  residentiel: 'projects.labelResidentiel',
  specialise: 'projects.labelSpecialise',
}

type PageProps = { params: Promise<{ slug: string }> }

function parts(item: string) {
  const [title, ...rest] = item.split(/\s+[—–-]\s+/)
  const detail = rest.join(' — ').trim()
  return {
    title: title?.trim() || item,
    detail: detail ? detail.charAt(0).toUpperCase() + detail.slice(1) : '',
  }
}

async function loadRealization(slug: string): Promise<Realization | null> {
  const locale = await getLocale()
  const path = withLocale(`/realizations?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`, locale)
  try {
    const response = await fetch(`${API_URL}${path}`, { cache: 'no-store' })
    if (!response.ok) return null
    const body = (await response.json()) as { docs?: Realization[] }
    return body.docs?.[0] ?? null
  } catch {
    return null
  }
}

function slidesOf(realization: Realization, categorySlug: string) {
  const photos = (realization.photos ?? []).flatMap((item) => {
    if (!item || typeof item !== 'object' || !item.url) return []
    const media = item as Media
    return [{ src: media.url as string, alt: media.alt?.trim() || realization.title }]
  })
  if (photos.length > 0) return photos.slice(0, 5)
  return [{ src: categoryFallbacks[categorySlug] || serviceFallbackSrc, alt: realization.title }]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const realization = await loadRealization(slug)
  return { title: realization?.title || 'Réalisations' }
}

export default async function RealizationPage({ params }: PageProps) {
  const { slug } = await params
  const t = await getT()
  const realization = await loadRealization(slug)
  const category = realization?.category
  if (!realization || !category || typeof category !== 'object' || !category.slug) notFound()

  const Icon = badgeIcon[category.slug] ?? Sparkles
  const slides = slidesOf(realization, category.slug)
  const paragraphs = (realization.description || realization.summary || '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const done = (realization.details ?? []).flatMap((row) => (row.item ? [parts(row.item)] : []))

  return (
    <article className="bg-canvas">
      <div className="mx-auto w-full max-w-[90rem] px-4 pt-8 pb-20 sm:px-6 lg:pt-10 lg:pb-28">
        <Breadcrumbs
          label={t('services.breadcrumb')}
          items={[
            { href: '/', label: t('nav.home') },
            { href: '/realisations', label: t('nav.projects') },
            { label: realization.title },
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

            {done.length > 0 ? (
              <aside className="rounded-3xl bg-white p-5 ring-1 ring-navy/10 sm:p-6" aria-labelledby="realization-done">
                <h2 id="realization-done" className="text-lg font-bold text-[#24306a]">
                  {t('projects.done')}
                </h2>
                <ul className="mt-5 space-y-4">
                  {done.map((item) => (
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
                <p className="inline-flex items-center gap-2 rounded-full bg-white py-1 pr-3 pl-1 text-sm font-semibold text-[#1e2b6e] shadow-sm ring-1 ring-navy/10">
                  <span
                    className={`inline-flex size-7 items-center justify-center rounded-lg ${badgeIconClass[category.slug] ?? 'bg-navy text-white'}`}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  {t(badgeLabel[category.slug] ?? 'projects.labelSpecialise')}
                </p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#1e2b6e]">{realization.title}</h1>
                <span className="mt-3 block h-2 w-12 rounded-full bg-highlight" aria-hidden />
                {paragraphs.length > 0 ? (
                  <div className="mt-4 max-w-2xl space-y-3 text-[15px] leading-7 text-navy/70">
                    {paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
                <Link
                  href={reservationHref}
                  className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-action px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#0544c4] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  <Calendar className="size-4" aria-hidden />
                  {t('projects.ctaAction')}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
              <ServicePhotoStrip />
            </div>
          </div>
        </ServiceGallery>
      </div>
    </article>
  )
}
