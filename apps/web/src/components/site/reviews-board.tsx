'use client'

import { ArrowRight, Building2, Car, ChevronDown, Home, ImagePlus, Info, Send, Sparkles, Star, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { createReview } from '@/app/avis/actions'
import { ScrollReveal } from '@/components/site/scroll-reveal'
import { fieldClass, fieldErrorClass, namePattern } from '@/lib/form-rules'
import type { ReviewCard } from '@/lib/reviews'

export type { ReviewCard }

export type ReviewService = { id: number; slug: string; title: string }

export type ReviewFocus = { id: number; slug: string; title: string }

const familyOrder = ['automobile', 'residentiel', 'commercial', 'specialise'] as const
const pageSize = 6
const maxFiles = 5
const maxBytes = 10 * 1024 * 1024
const maxText = 500

const familyIcon: Record<string, LucideIcon> = {
  automobile: Car,
  commercial: Building2,
  residentiel: Home,
  specialise: Sparkles,
}

const familyLabel: Record<string, string> = {
  automobile: 'projects.labelAutomobile',
  commercial: 'projects.labelCommercial',
  residentiel: 'projects.labelResidentiel',
  specialise: 'projects.labelSpecialise',
}

const badgeIconClass: Record<string, string> = {
  automobile: 'bg-accent text-white',
  commercial: 'bg-action text-white',
  residentiel: 'bg-action text-white',
  specialise: 'bg-highlight text-[#071b4b]',
}

const avatarClass = [
  'bg-[#e7efff] text-action',
  'bg-[#ffe8ee] text-accent',
  'bg-[#efe8ff] text-[#5b3cc4]',
  'bg-[#e7f8ef] text-[#0d8a4b]',
  'bg-[#fff4d6] text-[#8a6400]',
  'bg-[#e6f7fb] text-[#0b7494]',
]

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'])

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function Stars({ label, value }: { label?: string; value: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.min(1, Math.max(0, value - index))
        return (
          <span key={index} className="relative inline-flex size-4" aria-hidden>
            <Star className="size-4 text-navy/15" />
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="size-4 fill-highlight text-highlight" />
            </span>
          </span>
        )
      })}
    </span>
  )
}

export function ReviewsBoard({
  banner,
  focus,
  reviews,
  services,
}: {
  banner: string
  focus?: ReviewFocus | null
  reviews: ReviewCard[]
  services: ReviewService[]
}) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('tous')
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const listed = useMemo(
    () => (focus ? reviews.filter((review) => review.serviceSlug === focus.slug) : reviews),
    [focus, reviews],
  )
  const counts = useMemo(() => {
    const tally = new Map<string, number>()
    for (const review of listed) tally.set(review.categorySlug, (tally.get(review.categorySlug) ?? 0) + 1)
    return tally
  }, [listed])
  const mixed = useMemo(() => {
    const groups = familyOrder.map((slug) => listed.filter((review) => review.categorySlug === slug))
    const rows = Math.max(0, ...groups.map((group) => group.length))
    return Array.from({ length: rows }, (_, index) => groups.flatMap((group) => group[index] ?? [])).flat()
  }, [listed])
  const visible = filter === 'tous' ? mixed : listed.filter((review) => review.categorySlug === filter)
  const shown = visible.slice(0, visibleCount)
  const average = listed.length > 0 ? listed.reduce((sum, review) => sum + review.rating, 0) / listed.length : 0
  const averageLabel = average.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 })

  return (
    <div className="bg-canvas">
      <div className="mx-auto w-full max-w-[90rem] px-4 pt-10 pb-16 sm:px-6 lg:pt-14 lg:pb-24">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)]">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-navy/70 uppercase">
              <span className="h-2 w-12 rounded-full bg-highlight" aria-hidden />
              {t('reviews.eyebrow')}
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#1e2b6e] sm:text-4xl lg:text-5xl">{t('reviews.title')}</h1>
            <p className="mt-3 text-lg text-navy/70">{t('reviews.lead')}</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-navy/60">{t('reviews.text')}</p>
          </div>
          <div className="relative min-h-56 overflow-hidden rounded-3xl bg-[#d7e4f8]">
            <Image
              src={banner}
              alt=""
              fill
              priority
              sizes="420px"
              className="object-cover object-center"
            />
            <div className="relative z-10 m-4 max-w-[16rem] rounded-3xl bg-white/95 p-5 shadow-lg">
              {listed.length > 0 ? (
                <>
                  <p className="text-4xl font-bold tracking-tight text-[#1e2b6e]">
                    {averageLabel}
                    <span className="ml-1 text-xl font-semibold text-navy/35">/ 5</span>
                  </p>
                  <span className="mt-2 block">
                    <Stars label={averageLabel} value={average} />
                  </span>
                  <p className="mt-3 text-sm font-bold text-[#1e2b6e]">{t('reviews.count', { count: listed.length })}</p>
                  <p className="mt-1 text-xs leading-5 text-navy/55">{t('reviews.basedOn')}</p>
                </>
              ) : (
                <p className="text-sm leading-6 text-navy/70">{focus ? t('reviews.serviceEmpty') : t('reviews.empty')}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            {focus ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#1e2b6e]">{t('reviews.forService', { service: focus.title })}</p>
                <Link href="/avis" className="text-sm font-semibold text-action hover:underline">
                  {t('reviews.seeAll')}
                </Link>
              </div>
            ) : (
            <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('reviews.title')}>
              <FilterButton
                active={filter === 'tous'}
                label={`${t('reviews.all')} (${listed.length})`}
                onClick={() => {
                  setFilter('tous')
                  setVisibleCount(pageSize)
                }}
              />
              {familyOrder.map((slug) => {
                const Icon = familyIcon[slug] ?? Sparkles
                return (
                  <FilterButton
                    key={slug}
                    active={filter === slug}
                    icon={Icon}
                    label={`${t(familyLabel[slug] ?? 'projects.labelSpecialise')} (${counts.get(slug) ?? 0})`}
                    onClick={() => {
                      setFilter(slug)
                      setVisibleCount(pageSize)
                    }}
                  />
                )
              })}
            </div>
            )}

            {shown.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-white px-5 py-8 text-sm text-navy/60 ring-1 ring-navy/10">
                {focus ? t('reviews.serviceEmpty') : t('reviews.empty')}
              </p>
            ) : (
              <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {shown.map((review) => {
                  const Icon = familyIcon[review.categorySlug] ?? Sparkles
                  return (
                    <li key={review.id}>
                      <article className="flex h-full flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy/10">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex size-11 items-center justify-center rounded-full text-sm font-bold ${avatarClass[review.id % avatarClass.length]}`}
                          >
                            {initials(review.author)}
                          </span>
                          <span>
                            <span className="block font-bold text-[#1e2b6e]">{review.author}</span>
                            <span className="block text-xs text-navy/50">{review.date}</span>
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <Stars label={`${review.rating} / 5`} value={review.rating} />
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white py-1 pr-2.5 pl-1 text-xs font-semibold text-[#1e2b6e] ring-1 ring-navy/10">
                            <span
                              className={`inline-flex size-5 items-center justify-center rounded-md ${badgeIconClass[review.categorySlug] ?? 'bg-navy text-white'}`}
                            >
                              <Icon className="size-3" aria-hidden />
                            </span>
                            {t(familyLabel[review.categorySlug] ?? 'projects.labelSpecialise')}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-navy/75">{review.text}</p>
                        <ReviewPhotos review={review} />
                      </article>
                    </li>
                  )
                })}
              </ul>
            )}

            {visibleCount < visible.length ? (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#1e2b6e] ring-1 ring-navy/15 hover:ring-action"
                  onClick={() => setVisibleCount((count) => count + pageSize)}
                >
                  {t('reviews.more')}
                  <ChevronDown className="size-4" aria-hidden />
                </button>
              </div>
            ) : null}
          </div>

          <ReviewForm initialServiceId={focus?.id} services={services} />
        </div>
      </div>
    </div>
  )
}

function ReviewPhotos({ review }: { review: ReviewCard }) {
  return (
    <div className="mt-4">
      {review.photos.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2">
          {review.photos.slice(0, 3).map((photo) => (
            <li key={photo.src} className="overflow-hidden rounded-xl bg-canvas">
              {photo.video ? (
                <video src={photo.src} className="aspect-[4/3] w-full object-cover" controls />
              ) : (
                <Image src={photo.src} alt={photo.alt} width={240} height={180} className="aspect-[4/3] w-full object-cover" />
              )}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3 inline-flex rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-semibold text-action">{review.serviceTitle}</p>
    </div>
  )
}

export function HomeReviews({ reviews }: { reviews: ReviewCard[] }) {
  const { t } = useTranslation()
  if (reviews.length === 0) return null
  return (
    <section className="bg-canvas" aria-labelledby="avis-clients-titre">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-16 sm:px-6 lg:py-24">
        <ScrollReveal>
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-navy/70 uppercase">
            <span className="h-2 w-12 rounded-full bg-highlight" aria-hidden />
            {t('reviews.eyebrow')}
          </p>
          <h2 id="avis-clients-titre" className="mt-3 text-xl font-bold tracking-tight text-[#1e2b6e] sm:text-4xl lg:text-5xl">
            {t('reviews.title')}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-navy/70 sm:text-lg">{t('reviews.lead')}</p>
        </ScrollReveal>
        <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => {
            const Icon = familyIcon[review.categorySlug] ?? Sparkles
            return (
              <ScrollReveal key={review.id} as="li">
                <article className="flex h-full flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy/10">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex size-11 items-center justify-center rounded-full text-sm font-bold ${avatarClass[review.id % avatarClass.length]}`}
                    >
                      {initials(review.author)}
                    </span>
                    <span>
                      <span className="block font-bold text-[#1e2b6e]">{review.author}</span>
                      <span className="block text-xs text-navy/50">{review.date}</span>
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Stars label={`${review.rating} / 5`} value={review.rating} />
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white py-1 pr-2.5 pl-1 text-xs font-semibold text-[#1e2b6e] ring-1 ring-navy/10">
                      <span
                        className={`inline-flex size-5 items-center justify-center rounded-md ${badgeIconClass[review.categorySlug] ?? 'bg-navy text-white'}`}
                      >
                        <Icon className="size-3" aria-hidden />
                      </span>
                      {t(familyLabel[review.categorySlug] ?? 'projects.labelSpecialise')}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-navy/75">{review.text}</p>
                  <ReviewPhotos review={review} />
                </article>
              </ScrollReveal>
            )
          })}
        </ul>
        <ScrollReveal className="mt-8 text-center">
          <Link
            href="/avis"
            className="inline-flex items-center gap-2 rounded-full bg-action px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0544c4]"
          >
            {t('reviews.seeAll')}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}

function FilterButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon?: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
        active ? 'bg-action text-white' : 'bg-white text-navy ring-1 ring-navy/15 hover:ring-action'
      }`}
      onClick={onClick}
    >
      {Icon ? <Icon className="size-4" aria-hidden /> : null}
      {label}
    </button>
  )
}

type ReviewValues = {
  author: string
  consent: boolean
  files: File[]
  rating: number
  service: string
  text: string
}

function ReviewForm({ initialServiceId, services }: { initialServiceId?: number; services: ReviewService[] }) {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState('')
  const [sent, setSent] = useState(false)
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch,
  } = useForm<ReviewValues>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      author: '',
      consent: false,
      files: [],
      rating: 0,
      service: initialServiceId ? String(initialServiceId) : '',
      text: '',
    },
  })
  const text = watch('text')
  const files = watch('files')

  function messageFor(code: string) {
    if (code === 'service') return t('reviews.serviceError')
    if (code === 'too-long') return t('reviews.too-long')
    if (code === 'file-too-big') return t('reviews.file-too-big')
    if (code === 'file-type') return t('reviews.file-type')
    if (code === 'too-many') return t('reviews.too-many')
    if (code === 'missing') return t('reviews.missing')
    return t('reviews.save')
  }

  async function onSubmit(values: ReviewValues) {
    setSubmitError('')
    const formData = new FormData()
    formData.set('author', values.author.trim())
    formData.set('rating', String(values.rating))
    formData.set('service', values.service)
    formData.set('text', values.text.trim())
    formData.set('consent', 'true')
    for (const file of values.files) formData.append('media', file)
    const result = await createReview(formData)
    if (!result.ok) {
      setSubmitError(messageFor(result.message))
      return
    }
    setSent(true)
  }

  return (
    <aside className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy/10 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold text-[#1e2b6e] sm:text-2xl">{t('reviews.formTitle')}</h2>
      {sent ? (
        <p className="mt-3 text-sm leading-6 text-navy/70">
          <span className="block font-bold text-[#1e2b6e]">{t('reviews.successTitle')}</span>
          {t('reviews.successText')}
        </p>
      ) : (
        <form className="mt-2" noValidate onSubmit={handleSubmit(onSubmit)}>
          <p className="text-sm leading-6 text-navy/60">{t('reviews.formIntro')}</p>
          <label className="mt-4 block text-sm font-semibold text-[#1e2b6e]">
            {t('reviews.name')}
            <input
              {...register('author', {
                required: t('form.required'),
                minLength: { value: 2, message: t('form.min', { count: 2 }) },
                pattern: { value: namePattern.value, message: t(namePattern.messageKey) },
              })}
              maxLength={80}
              aria-invalid={Boolean(errors.author)}
              className={`mt-2 ${fieldClass} ${fieldErrorClass(Boolean(errors.author))}`}
            />
            {errors.author ? <span className="mt-1 block text-xs font-medium text-accent">{errors.author.message}</span> : null}
          </label>
          <fieldset className="mt-4">
            <legend className="text-sm font-semibold text-[#1e2b6e]">
              {t('reviews.rating')} <span className="text-accent">*</span>
            </legend>
            <Controller
              name="rating"
              control={control}
              rules={{
                validate: (value) => (value >= 1 && value <= 5 ? true : t('form.rating')),
              }}
              render={({ field }) => (
                <span className="mt-2 inline-flex gap-1">
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1
                    const active = value <= field.value
                    return (
                      <button
                        key={value}
                        type="button"
                        className="cursor-pointer rounded-md p-0.5"
                        aria-label={`${value} / 5`}
                        aria-pressed={active}
                        onBlur={field.onBlur}
                        onClick={() => field.onChange(value)}
                      >
                        <Star className={`size-7 ${active ? 'fill-highlight text-highlight' : 'text-navy/20'}`} />
                      </button>
                    )
                  })}
                </span>
              )}
            />
            {errors.rating ? <span className="mt-1 block text-xs font-medium text-accent">{errors.rating.message}</span> : null}
          </fieldset>
          <label className="mt-4 block text-sm font-semibold text-[#1e2b6e]">
            {t('reviews.service')} <span className="text-accent">*</span>
            <select
              {...register('service', { required: t('form.select') })}
              aria-invalid={Boolean(errors.service)}
              className={`mt-2 ${fieldClass} ${fieldErrorClass(Boolean(errors.service))}`}
            >
              <option value="">{t('reviews.servicePlaceholder')}</option>
              {services.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            {errors.service ? <span className="mt-1 block text-xs font-medium text-accent">{errors.service.message}</span> : null}
          </label>
          <label className="mt-4 block text-sm font-semibold text-[#1e2b6e]">
            <span className="flex items-center justify-between gap-3">
              <span>
                {t('reviews.textLabel')} <span className="text-accent">*</span>
              </span>
              <span className="text-xs font-normal text-navy/45">
                {text.length}/{maxText}
              </span>
            </span>
            <textarea
              {...register('text', {
                required: t('form.required'),
                minLength: { value: 10, message: t('form.min', { count: 10 }) },
                maxLength: { value: maxText, message: t('form.max', { count: maxText }) },
              })}
              maxLength={maxText}
              rows={4}
              placeholder={t('reviews.textPlaceholder')}
              aria-invalid={Boolean(errors.text)}
              className={`mt-2 resize-none ${fieldClass} ${fieldErrorClass(Boolean(errors.text))}`}
            />
            {errors.text ? <span className="mt-1 block text-xs font-medium text-accent">{errors.text.message}</span> : null}
          </label>
          <div className="mt-4">
            <p className="text-sm font-semibold text-[#1e2b6e]">{t('reviews.files')}</p>
            <Controller
              name="files"
              control={control}
              rules={{
                validate: (list) => {
                  if (list.length > maxFiles) return t('reviews.too-many')
                  for (const file of list) {
                    if (file.size > maxBytes) return t('reviews.file-too-big')
                    if (file.type && !allowedTypes.has(file.type)) return t('reviews.file-type')
                  }
                  return true
                },
              }}
              render={({ field }) => (
                <label className="mt-2 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-navy/20 px-4 py-5 text-center hover:border-action">
                  <ImagePlus className="size-6 text-action" aria-hidden />
                  <span className="mt-2 text-sm font-semibold text-action">{t('reviews.filesHint')}</span>
                  <span className="mt-1 text-xs text-navy/50">{t('reviews.filesTypes')}</span>
                  <span className="text-xs text-navy/50">{t('reviews.filesSize')}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,.jpg,.jpeg,.png,.mp4,.mov"
                    multiple
                    className="sr-only"
                    onBlur={field.onBlur}
                    onChange={(event) => field.onChange(Array.from(event.target.files ?? []))}
                  />
                </label>
              )}
            />
            {files.length > 0 ? <p className="mt-2 text-xs text-navy/60">{files.map((file) => file.name).join(', ')}</p> : null}
            {errors.files ? <span className="mt-1 block text-xs font-medium text-accent">{errors.files.message}</span> : null}
          </div>
          <Controller
            name="consent"
            control={control}
            rules={{ validate: (value) => value || t('form.consent') }}
            render={({ field }) => (
              <label className="mt-4 flex items-start gap-2 text-sm leading-5 text-navy/70">
                <input
                  type="checkbox"
                  checked={field.value}
                  className="mt-1 size-4 accent-[#0755f5]"
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                <span>{t('reviews.consent')}</span>
              </label>
            )}
          />
          {errors.consent ? <span className="mt-1 block text-xs font-medium text-accent">{errors.consent.message}</span> : null}
          {submitError ? <p className="mt-3 text-sm font-medium text-accent">{submitError}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-action px-5 py-3 text-sm font-semibold text-white hover:bg-[#0544c4] disabled:cursor-wait disabled:opacity-70"
          >
            <Send className="size-4" aria-hidden />
            {isSubmitting ? t('reviews.sending') : t('reviews.submit')}
          </button>
        </form>
      )}
      <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-navy/50">
        <Info className="mt-0.5 size-4 shrink-0 text-action" aria-hidden />
        {t('reviews.footnote')}
      </p>
    </aside>
  )
}
