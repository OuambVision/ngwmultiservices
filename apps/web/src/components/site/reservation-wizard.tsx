'use client'

import { API_URL } from '@repo/api'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Car,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Home,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { createBooking } from '@/app/reservation/actions'
import {
  bookingWindowFallback,
  reservationReceiptKey,
  type BookingWindow,
  type ReservationCategory,
  type ReservationReceipt,
  type ReservationService,
} from '@/components/site/reservation-types'
import { ServiceRating } from '@/components/site/service-rating'
import {
  emailPattern,
  fieldClassWithIcon,
  fieldErrorClass,
  namePattern,
  optionalPhoneValidate,
  phonePattern,
} from '@/lib/form-rules'

type ContactValues = {
  address: string
  email: string
  location: 'client' | 'ngw' | ''
  name: string
  note: string
  phone: string
}

const categoryIcons: Record<string, LucideIcon> = {
  automobile: Car,
  residentiel: Home,
  commercial: FileText,
  specialise: Shield,
}

const steps = ['stepService', 'stepDate', 'stepInfo', 'stepConfirm'] as const

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function monthCells(year: number, month: number) {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const cells: { iso: string; outside: boolean }[] = []
  for (let index = 0; index < firstWeekday; index += 1) {
    const date = new Date(Date.UTC(year, month - 1, index - firstWeekday + 1))
    cells.push({ iso: date.toISOString().slice(0, 10), outside: true })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ iso: `${year}-${pad(month)}-${pad(day)}`, outside: false })
  }
  let extra = 1
  while (cells.length % 7 !== 0) {
    const date = new Date(Date.UTC(year, month, extra))
    cells.push({ iso: date.toISOString().slice(0, 10), outside: true })
    extra += 1
  }
  return cells
}

function formatDay(iso: string, locale: string) {
  const [year, month, day] = iso.split('-').map(Number)
  const formatted = new Intl.DateTimeFormat(locale.startsWith('en') ? 'en-CA' : 'fr-CA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function includedTitle(item: string) {
  const [title] = item.split(/\s+[—–-]\s+/)
  return title?.trim() || item
}

function Stepper({
  serviceTitle,
  step,
}: {
  serviceTitle?: string
  step: number
}) {
  const { t } = useTranslation()
  return (
    <ol className="mx-auto grid max-w-3xl grid-cols-4 gap-2">
      {steps.map((key, index) => {
        const number = index + 1
        const done = number < step
        const current = number === step
        return (
          <li key={key} className="relative text-center">
            {index < steps.length - 1 ? (
              <span
                className={`absolute top-4 left-[calc(50%+1.1rem)] h-0.5 w-[calc(100%-2.2rem)] ${done ? 'bg-action' : 'bg-navy/15'}`}
                aria-hidden
              />
            ) : null}
            <span
              className={`relative mx-auto flex size-8 items-center justify-center rounded-full text-sm font-bold ${
                done || current ? 'bg-action text-white' : 'bg-white text-navy/40 ring-1 ring-navy/15'
              }`}
            >
              {done ? <Check className="size-4" aria-hidden /> : number}
            </span>
            <p className={`mt-2 text-sm font-semibold ${current ? 'text-action' : 'text-navy/70'}`}>
              {t(`reservation.${key}`)}
            </p>
            <p className="text-xs text-navy/45">
              {number === 1 && serviceTitle && step > 1 ? serviceTitle : t(`reservation.${key}Hint`)}
            </p>
          </li>
        )
      })}
    </ol>
  )
}

function StepNav({
  backLabel,
  backDisabled,
  compact,
  nextDisabled,
  nextLabel,
  nextSubmit,
  nextType = 'button',
  onBack,
  onNext,
}: {
  backLabel?: string
  backDisabled?: boolean
  compact?: boolean
  nextDisabled?: boolean
  nextLabel: string
  nextSubmit?: boolean
  nextType?: 'button' | 'submit'
  onBack?: () => void
  onNext?: () => void
}) {
  const size = compact
    ? 'rounded-lg px-3 py-1.5 text-xs font-semibold'
    : 'rounded-xl px-5 py-3 text-sm font-semibold'
  const icon = compact ? 'size-3.5' : 'size-4'
  return (
    <div className={`flex flex-wrap items-center gap-2 ${onBack ? 'justify-between' : 'justify-end'}`}>
      {onBack ? (
        <button
          type="button"
          disabled={backDisabled}
          className={`inline-flex cursor-pointer items-center gap-1.5 border border-navy/15 bg-white text-navy disabled:cursor-not-allowed disabled:opacity-50 ${size}`}
          onClick={onBack}
        >
          <ArrowLeft className={icon} aria-hidden />
          {backLabel}
        </button>
      ) : null}
      <button
        type={nextType}
        form={nextSubmit ? 'reservation-contact' : undefined}
        disabled={nextDisabled}
        className={`inline-flex cursor-pointer items-center gap-1.5 bg-action text-white hover:bg-[#0544c4] disabled:cursor-wait disabled:opacity-70 ${size}`}
        onClick={nextType === 'button' ? onNext : undefined}
      >
        {nextLabel}
        <ArrowRight className={icon} aria-hidden />
      </button>
    </div>
  )
}

export function ReservationWizard({
  categories,
  initialSlug,
}: {
  categories: ReservationCategory[]
  initialSlug?: string
}) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const stepTopRef = useRef<HTMLDivElement>(null)
  const services = useMemo(() => categories.flatMap((category) => category.services), [categories])
  const initial = services.find((service) => service.slug === initialSlug) ?? null
  const [step, setStep] = useState(1)
  const [openCategory, setOpenCategory] = useState(initial?.categorySlug ?? '')
  const [service, setService] = useState<ReservationService | null>(initial)
  const [bookingWindow, setBookingWindow] = useState<BookingWindow>(bookingWindowFallback)
  const [month, setMonth] = useState(() => {
    const [year, value] = bookingWindowFallback.start.split('-').map(Number)
    return { year, month: value }
  })
  const [openDates, setOpenDates] = useState<string[]>([])
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [slotsReady, setSlotsReady] = useState(false)
  const [time, setTime] = useState('')
  const [error, setError] = useState('')
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<ContactValues>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: { address: '', email: '', location: '', name: '', note: '', phone: '' },
  })
  const location = watch('location')
  const address = watch('address')
  const locale = i18n.language.startsWith('en') ? 'en' : 'fr'
  const weekdays = t('reservation.weekdays').split(',')
  const monthStart = `${month.year}-${pad(month.month)}-01`
  const monthEndDate = new Date(Date.UTC(month.year, month.month, 0)).getUTCDate()
  const monthEnd = `${month.year}-${pad(month.month)}-${pad(monthEndDate)}`
  const from = monthStart < bookingWindow.start ? bookingWindow.start : monthStart
  const to = monthEnd > bookingWindow.end ? bookingWindow.end : monthEnd

  useEffect(() => {
    const target = stepTopRef.current
    if (!target) return
    const header = document.querySelector('header.sticky')
    const headerOffset = (header instanceof HTMLElement ? header.offsetHeight : 64) + 12
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset
    window.scrollTo({ top: Math.max(0, top), left: 0, behavior: 'auto' })
  }, [step])

  useEffect(() => {
    let ignore = false
    fetch(`${API_URL}/availability/window`)
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { end?: string; start?: string } | null) => {
        if (ignore || !body?.start || !body?.end) return
        const start = body.start
        const end = body.end
        setBookingWindow({ start, end })
        setMonth((current) => {
          const iso = `${current.year}-${pad(current.month)}`
          if (iso >= start.slice(0, 7) && iso <= end.slice(0, 7)) return current
          const [year, value] = start.split('-').map(Number)
          return { year, month: value }
        })
      })
      .catch(() => undefined)
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (!service || step !== 2) return
    let ignore = false
    setOpenDates([])
    fetch(`${API_URL}/availability/days?service=${service.id}&from=${from}&to=${to}`)
      .then((response) => (response.ok ? response.json() : { dates: [] }))
      .then((body: { dates?: string[] }) => {
        if (!ignore) setOpenDates(body.dates ?? [])
      })
      .catch(() => {
        if (!ignore) setOpenDates([])
      })
    return () => {
      ignore = true
    }
  }, [from, service, step, to])

  useEffect(() => {
    if (!service || !date) {
      setSlots([])
      setSlotsReady(false)
      return
    }
    let ignore = false
    setSlotsReady(false)
    fetch(`${API_URL}/availability/slots?service=${service.id}&date=${date}`)
      .then((response) => (response.ok ? response.json() : { slots: [] }))
      .then((body: { slots?: string[] }) => {
        if (ignore) return
        const next = body.slots ?? []
        setSlots(next)
        setSlotsReady(true)
        setTime((current) => (next.includes(current) ? current : ''))
      })
      .catch(() => {
        if (!ignore) {
          setSlots([])
          setSlotsReady(true)
          setTime('')
        }
      })
    return () => {
      ignore = true
    }
  }, [date, service])

  const shiftMonth = (delta: number) => {
    const next = new Date(Date.UTC(month.year, month.month - 1 + delta, 1))
    const iso = next.toISOString().slice(0, 7)
    if (iso < bookingWindow.start.slice(0, 7) || iso > bookingWindow.end.slice(0, 7)) return
    setMonth({ year: next.getUTCFullYear(), month: next.getUTCMonth() + 1 })
  }

  const continueFromService = () => {
    if (!service) {
      setError(t('reservation.missingService'))
      return
    }
    setError('')
    setStep(2)
  }

  const continueFromDate = () => {
    if (!date || !time) {
      setError(t('reservation.missingSlot'))
      return
    }
    setError('')
    setStep(3)
  }

  const submitContact = handleSubmit(async (values) => {
    if (!service || !date || !time) return
    if (values.location !== 'client' && values.location !== 'ngw') {
      setError(t('reservation.missingLocation'))
      return
    }
    setError('')
    const result = await createBooking({
      address: values.address,
      date,
      email: values.email,
      location: values.location,
      name: values.name,
      note: values.note,
      phone: values.phone,
      service: service.id,
      time,
    })
    if (!result.ok) {
      setError(result.message || t('reservation.submitError'))
      return
    }
    const receipt: ReservationReceipt = {
      categoryTitle: service.categoryTitle,
      dateLabel: `${formatDay(date, locale)} ${locale === 'en' ? 'at' : 'à'} ${time}`,
      duration: service.duration,
      image: service.image,
      imageAlt: service.imageAlt,
      place:
        values.location === 'client'
          ? `${t('reservation.locationClient')} — ${values.address.trim()}`
          : t('reservation.locationNgw'),
      price: service.price,
      reference: result.reference,
      serviceTitle: service.title,
      summary: service.summary,
      time,
    }
    sessionStorage.setItem(reservationReceiptKey, JSON.stringify(receipt))
    router.push(`/reservation/confirmation?reference=${encodeURIComponent(result.reference)}`)
  })

  const monthLabel = new Intl.DateTimeFormat(locale === 'en' ? 'en-CA' : 'fr-CA', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(month.year, month.month - 1, 1)))
  const monthTitle = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
  const open = new Set(openDates)

  return (
    <div className="bg-canvas">
      {step === 1 ? (
        <div ref={stepTopRef} className="mx-auto w-full max-w-[90rem] px-4 pt-10 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight text-[#1e2b6e] sm:text-3xl lg:text-4xl">
            {t('reservation.step1Title')}
          </h1>
          <div className="mt-8">
            <Stepper serviceTitle={service?.title} step={1} />
          </div>
          <div className="mt-4">
            <StepNav compact nextLabel={t('reservation.next')} onNext={continueFromService} />
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden bg-navy">
          {service ? (
            <Image src={service.image} alt="" fill sizes="100vw" className="object-cover opacity-40" priority />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071b4b] via-[#071b4b]/88 to-[#071b4b]/35" />
          <div className="relative mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-6 lg:py-10">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-white/75" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white">
                {t('nav.home')}
              </Link>
              <span aria-hidden>›</span>
              <button type="button" className="cursor-pointer hover:text-white" onClick={() => setStep(1)}>
                {t('reservation.crumb')}
              </button>
              <span aria-hidden>›</span>
              <span className="text-white">{step === 2 ? t('reservation.stepDate') : t('reservation.stepInfo')}</span>
            </nav>
            {step === 2 ? (
              <>
                <h1 className="mt-4 text-xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {t('reservation.step2Title')}
                </h1>
                <p className="mt-2 max-w-2xl text-white/80">{t('reservation.step2Text')}</p>
              </>
            ) : (
              <>
                <p className="mt-4 flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-white/80 uppercase">
                  <span className="h-0.5 w-8 bg-highlight" aria-hidden />
                  {t('reservation.eyebrow')}
                </p>
                <h1 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-3xl lg:text-5xl">
                  {t('reservation.step3Title')} <span className="text-highlight">{t('reservation.step3Accent')}</span>
                </h1>
                <p className="mt-2 max-w-2xl text-white/80">{t('reservation.step3Text')}</p>
              </>
            )}
          </div>
        </div>
      )}

      <div
        ref={step > 1 ? stepTopRef : undefined}
        className="mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-6 lg:pb-20"
      >
        {step > 1 ? (
          <>
            <Stepper serviceTitle={service?.title} step={step} />
            <div className="mt-4">
              {step === 2 ? (
                <StepNav
                  compact
                  backLabel={t('reservation.previous')}
                  nextLabel={t('reservation.next')}
                  onBack={() => setStep(1)}
                  onNext={continueFromDate}
                />
              ) : (
                <StepNav
                  compact
                  backLabel={t('reservation.previous')}
                  nextDisabled={isSubmitting}
                  nextLabel={isSubmitting ? t('reservation.sending') : t('reservation.confirmShort')}
                  nextSubmit
                  nextType="submit"
                  onBack={() => setStep(2)}
                />
              )}
            </div>
          </>
        ) : null}

        {error ? (
          <p className="mx-auto mt-6 max-w-3xl rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent" role="alert">
            {error}
          </p>
        ) : null}

        {step === 1 ? (
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(18rem,0.86fr)_minmax(0,1.14fr)]">
            <div>
              <h2 className="text-lg font-bold text-[#1e2b6e] sm:text-2xl">{t('reservation.chooseService')}</h2>
              <p className="mt-1 text-sm text-navy/60">{t('reservation.chooseServiceText')}</p>
              <div className="mt-5 space-y-3">
                {categories.map((category) => {
                  const Icon = categoryIcons[category.slug] ?? Car
                  const expanded = openCategory === category.slug
                  return (
                    <section
                      key={category.slug}
                      className={`overflow-hidden rounded-2xl bg-white ring-1 ${expanded ? 'ring-accent/30' : 'ring-navy/10'}`}
                    >
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left"
                        aria-expanded={expanded}
                        onClick={() => setOpenCategory(expanded ? '' : category.slug)}
                      >
                        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-action/10 text-action">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <span className="flex-1 font-bold text-[#1e2b6e]">{category.title}</span>
                        <ChevronDown className={`size-4 text-navy/50 transition ${expanded ? 'rotate-180' : ''}`} aria-hidden />
                      </button>
                      {expanded ? (
                        <ul className="space-y-1 px-3 pb-3">
                          {category.services.map((item) => {
                            const selected = service?.id === item.id
                            return (
                              <li key={item.id}>
                                <label
                                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 ${selected ? 'bg-accent/5' : 'hover:bg-canvas'}`}
                                >
                                  <input
                                    type="radio"
                                    name="service"
                                    className="size-4 accent-action"
                                    checked={selected}
                                    onChange={() => {
                                      setService(item)
                                      setDate('')
                                      setTime('')
                                      setError('')
                                    }}
                                  />
                                  {selected ? (
                                    <span className="relative size-14 overflow-hidden rounded-lg bg-canvas">
                                      <Image src={item.image} alt="" fill className="object-cover" sizes="56px" />
                                    </span>
                                  ) : null}
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium text-navy">{item.title}</span>
                                    {item.ratingCount > 0 ? (
                                      <ServiceRating average={item.ratingAverage} count={item.ratingCount} size="xs" className="mt-0.5" />
                                    ) : null}
                                  </span>
                                </label>
                              </li>
                            )
                          })}
                        </ul>
                      ) : null}
                    </section>
                  )
                })}
              </div>
            </div>

            {service ? (
              <article className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-navy/10 sm:p-5">
                <div className="overflow-hidden rounded-2xl bg-canvas">
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    width={1200}
                    height={700}
                    className="aspect-[16/9] w-full object-cover"
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#1e2b6e] sm:text-2xl">{service.title}</h2>
                    {service.ratingCount > 0 ? (
                      <ServiceRating
                        average={service.ratingAverage}
                        count={service.ratingCount}
                        href={`/avis?service=${service.slug}`}
                        size="sm"
                        className="mt-1"
                      />
                    ) : null}
                  </div>
                  {service.price ? (
                    <p className="text-[#1e2b6e]">
                      <span className="text-sm font-semibold">{t('services.from')}</span>{' '}
                      <span className="text-xl font-extrabold tracking-tight sm:text-3xl">{service.price}</span>
                    </p>
                  ) : null}
                </div>
                {service.summary ? <p className="mt-2 text-sm leading-6 text-navy/70">{service.summary}</p> : null}
                <div className="mt-4 grid gap-3 rounded-2xl bg-canvas p-3 sm:grid-cols-3">
                  {service.duration ? (
                    <p className="flex items-start gap-2 text-sm">
                      <Clock className="mt-0.5 size-4 text-action" aria-hidden />
                      <span>
                        <span className="block text-xs text-navy/50">{t('reservation.durationLabel')}</span>
                        <span className="font-semibold text-navy">{service.duration}</span>
                      </span>
                    </p>
                  ) : null}
                  {service.place ? (
                    <p className="flex items-start gap-2 text-sm">
                      <MapPin className="mt-0.5 size-4 text-action" aria-hidden />
                      <span>
                        <span className="block text-xs text-navy/50">{t('reservation.placeLabel')}</span>
                        <span className="font-semibold text-navy">{service.place}</span>
                      </span>
                    </p>
                  ) : null}
                  {service.included.length > 0 ? (
                    <p className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 text-action" aria-hidden />
                      <span>
                        <span className="block text-xs text-navy/50">{t('services.included')}</span>
                        <span className="font-semibold text-navy">{service.included.length}</span>
                      </span>
                    </p>
                  ) : null}
                </div>
                {service.included.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-[#1e2b6e]">{t('reservation.includedLabel')} :</p>
                    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                      {service.included.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-navy/80">
                          <Check className="mt-0.5 size-4 shrink-0 text-action" aria-hidden />
                          {includedTitle(item)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <button
                  type="button"
                  className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-action px-5 py-3 text-sm font-semibold text-white hover:bg-[#0544c4]"
                  onClick={continueFromService}
                >
                  {t('reservation.nextDate')}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </article>
            ) : (
              <p className="rounded-3xl bg-white p-8 text-sm text-navy/60 ring-1 ring-navy/10">
                {t('reservation.chooseServiceText')}
              </p>
            )}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-8">
            <div className="grid items-start gap-5 lg:grid-cols-2">
              <section className="rounded-3xl bg-white p-5 ring-1 ring-navy/10">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#1e2b6e]">
                  <Calendar className="size-5 text-action" aria-hidden />
                  {t('reservation.pickDate')}
                </h2>
                <div className="mt-4 flex items-center justify-between">
                  <button type="button" className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-navy hover:bg-canvas" aria-label={t('reservation.previous')} onClick={() => shiftMonth(-1)}>
                    <ChevronLeft className="size-5" aria-hidden />
                  </button>
                  <p className="font-bold text-[#1e2b6e]">{monthTitle}</p>
                  <button type="button" className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-navy hover:bg-canvas" aria-label={t('reservation.nextInfo')} onClick={() => shiftMonth(1)}>
                    <ChevronRight className="size-5" aria-hidden />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-navy/45">
                  {weekdays.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-7 gap-1">
                  {monthCells(month.year, month.month).map((cell) => {
                    const available = !cell.outside && open.has(cell.iso)
                    const selected = cell.iso === date
                    return (
                      <button
                        key={`${cell.iso}-${cell.outside ? 'out' : 'in'}`}
                        type="button"
                        disabled={!available}
                        className={`h-10 rounded-lg text-sm ${
                          selected
                            ? 'bg-action font-bold text-white'
                            : available
                              ? 'cursor-pointer font-semibold text-navy hover:bg-canvas'
                              : 'text-navy/25'
                        }`}
                        onClick={() => {
                          setDate(cell.iso)
                          setError('')
                        }}
                      >
                        {Number(cell.iso.slice(8))}
                      </button>
                    )
                  })}
                </div>
              </section>
              <section className="rounded-3xl bg-white p-5 ring-1 ring-navy/10">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#1e2b6e]">
                  <Clock className="size-5 text-action" aria-hidden />
                  {t('reservation.availableHours')}
                </h2>
                {date ? <p className="mt-3 font-semibold text-action">{formatDay(date, locale)}</p> : null}
                {!date ? <p className="mt-6 text-sm text-navy/60">{t('reservation.pickDateFirst')}</p> : null}
                {date && slotsReady && slots.length === 0 ? (
                  <p className="mt-6 text-sm text-navy/60">{t('reservation.noHours')}</p>
                ) : null}
                {slots.length > 0 ? (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`cursor-pointer rounded-xl border px-3 py-3 text-sm font-semibold ${
                          time === slot
                            ? 'border-action bg-action text-white'
                            : 'border-navy/10 bg-white text-navy hover:border-action'
                        }`}
                        onClick={() => {
                          setTime(slot)
                          setError('')
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : null}
              </section>
            </div>
            <div className="mt-6">
              <StepNav
                backLabel={t('reservation.previous')}
                nextLabel={t('reservation.nextInfo')}
                onBack={() => setStep(1)}
                onNext={continueFromDate}
              />
            </div>
          </div>
        ) : null}

        {step === 3 && service ? (
          <div className="mt-8">
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
              <form
                id="reservation-contact"
                className="rounded-3xl bg-white p-5 ring-1 ring-navy/10 sm:p-6"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault()
                  void submitContact()
                }}
              >
                <h2 className="text-lg font-bold text-[#1e2b6e] sm:text-xl">{t('reservation.yourInfo')}</h2>
                <p className="mt-1 text-sm text-navy/60">{t('reservation.yourInfoText')}</p>
                <fieldset className="mt-5">
                  <legend className="text-sm font-semibold text-navy">
                    {t('reservation.locationChoice')}
                    <span className="text-accent"> *</span>
                  </legend>
                  <Controller
                    name="location"
                    control={control}
                    rules={{ required: t('form.select') }}
                    render={({ field }) => (
                      <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        {(['client', 'ngw'] as const).map((choice) => {
                          const selected = field.value === choice
                          return (
                            <label
                              key={choice}
                              className={`cursor-pointer rounded-xl border px-4 py-3 ${
                                selected ? 'border-action bg-action/5' : 'border-navy/10 hover:border-action/40'
                              }`}
                            >
                              <input
                                type="radio"
                                name={field.name}
                                className="size-4 accent-action"
                                checked={selected}
                                onBlur={field.onBlur}
                                onChange={() => {
                                  field.onChange(choice)
                                  setError('')
                                  if (choice === 'ngw') setValue('address', '')
                                }}
                              />
                              <span className="ml-2 font-semibold text-[#1e2b6e]">
                                {t(choice === 'client' ? 'reservation.locationClient' : 'reservation.locationNgw')}
                              </span>
                              <span className="mt-1 block text-sm font-normal text-navy/60">
                                {t(choice === 'client' ? 'reservation.locationClientHint' : 'reservation.locationNgwHint')}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  />
                  {errors.location ? (
                    <span className="mt-2 block text-xs font-medium text-accent">{errors.location.message}</span>
                  ) : null}
                </fieldset>
                <div className="mt-5 space-y-4">
                  <Field
                    icon={User}
                    label={t('reservation.fullName')}
                    required
                    autoComplete="name"
                    error={errors.name?.message}
                    registration={register('name', {
                      required: t('form.required'),
                      minLength: { value: 2, message: t('form.min', { count: 2 }) },
                      pattern: { value: namePattern.value, message: t(namePattern.messageKey) },
                    })}
                  />
                  <Field
                    icon={Mail}
                    label={t('reservation.email')}
                    required
                    type="email"
                    autoComplete="email"
                    error={errors.email?.message}
                    registration={register('email', {
                      required: t('form.required'),
                      pattern: { value: emailPattern.value, message: t(emailPattern.messageKey) },
                    })}
                  />
                  <Field
                    icon={Phone}
                    label={t('reservation.phone')}
                    type="tel"
                    autoComplete="tel"
                    error={errors.phone?.message}
                    registration={register('phone', {
                      validate: optionalPhoneValidate(t(phonePattern.messageKey)),
                    })}
                  />
                  {location === 'client' ? (
                    <Field
                      icon={MapPin}
                      label={t('reservation.address')}
                      required
                      autoComplete="street-address"
                      error={errors.address?.message}
                      registration={register('address', {
                        required: t('form.address'),
                        minLength: { value: 5, message: t('form.min', { count: 5 }) },
                      })}
                    />
                  ) : null}
                  <Field
                    icon={FileText}
                    label={t('reservation.note')}
                    placeholder={t('reservation.notePlaceholder')}
                    error={errors.note?.message}
                    registration={register('note', {
                      maxLength: { value: 500, message: t('form.max', { count: 500 }) },
                    })}
                  />
                </div>
              </form>
              <aside className="rounded-3xl bg-white p-5 ring-1 ring-navy/10">
                <h2 className="text-lg font-bold text-[#1e2b6e] sm:text-xl">{t('reservation.summary')}</h2>
                <p className="mt-1 text-sm text-navy/60">{t('reservation.summaryText')}</p>
                <div className="mt-4 flex gap-3">
                  <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-canvas">
                    <Image src={service.image} alt="" fill className="object-cover" sizes="80px" />
                  </span>
                  <span>
                    <span className="block font-bold text-[#1e2b6e]">{service.title}</span>
                    <span className="text-sm text-navy/55">{service.categoryTitle}</span>
                  </span>
                </div>
                <dl className="mt-4 space-y-3 text-sm">
                  <SummaryRow icon={Calendar} label={t('reservation.dateLabel')} value={date ? formatDay(date, locale) : ''} />
                  <SummaryRow icon={Clock} label={t('reservation.timeLabel')} value={time} />
                  <SummaryRow icon={Clock} label={t('reservation.durationLabel')} value={service.duration} />
                  <SummaryRow
                    icon={MapPin}
                    label={t('reservation.placeLabel')}
                    value={
                      location === 'client'
                        ? `${t('reservation.locationClient')}${address.trim() ? ` — ${address.trim()}` : ''}`
                        : location === 'ngw'
                          ? t('reservation.locationNgw')
                          : ''
                    }
                  />
                  <SummaryRow icon={FileText} label={t('reservation.priceLabel')} value={service.price ? `${t('services.from')} ${service.price}` : ''} />
                </dl>
              </aside>
            </div>
            <div className="mt-6">
              <StepNav
                backLabel={t('reservation.previous')}
                nextDisabled={isSubmitting}
                nextLabel={isSubmitting ? t('reservation.sending') : t('reservation.confirm')}
                nextSubmit
                nextType="submit"
                onBack={() => setStep(2)}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function Field({
  autoComplete,
  error,
  icon: Icon,
  label,
  placeholder,
  registration,
  required,
  type = 'text',
}: {
  autoComplete?: string
  error?: string
  icon: LucideIcon
  label: string
  placeholder?: string
  registration: UseFormRegisterReturn
  required?: boolean
  type?: string
}) {
  const id = label.replace(/\s+/g, '-').toLowerCase()
  return (
    <label className="block text-sm font-semibold text-navy" htmlFor={id}>
      {label}
      {required ? <span className="text-accent"> *</span> : null}
      <span className="relative mt-1.5 block">
        <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy/35" aria-hidden />
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={`${fieldClassWithIcon} ${fieldErrorClass(Boolean(error))}`}
          {...registration}
        />
      </span>
      {error ? <span className="mt-1 block text-xs font-medium text-accent">{error}</span> : null}
    </label>
  )
}

function SummaryRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="inline-flex items-center gap-2 text-navy/55">
        <Icon className="size-4 text-action" aria-hidden />
        {label} :
      </dt>
      <dd className="text-right font-semibold text-navy">{value}</dd>
    </div>
  )
}
