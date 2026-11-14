'use client'

import { ArrowRight, Check, ClipboardList, FileText, Mail, Phone, User, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { createQuote } from '@/app/soumission/actions'
import { reservationHref } from '@/config/site'
import {
  emailPattern,
  fieldClassWithIcon,
  fieldErrorClass,
  namePattern,
  optionalPhoneValidate,
  phonePattern,
} from '@/lib/form-rules'

type QuoteCategory = {
  id: number
  title: string
}

type QuoteValues = {
  category: string
  email: string
  name: string
  need: string
  phone: string
}

export function QuoteForm({ categories, initialCategory }: { categories: QuoteCategory[]; initialCategory?: number }) {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState('')
  const [sent, setSent] = useState(false)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<QuoteValues>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      category: initialCategory ? String(initialCategory) : '',
      email: '',
      name: '',
      need: '',
      phone: '',
    },
  })

  async function onSubmit(values: QuoteValues) {
    setSubmitError('')
    const other = values.category === 'autre'
    const result = await createQuote({
      category: other ? undefined : Number(values.category),
      email: values.email,
      name: values.name,
      need: values.need,
      other,
      phone: values.phone,
    })
    if (!result.ok) {
      setSubmitError(result.message || t('quote.submitError'))
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="text-center">
          <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="size-8" strokeWidth={3} aria-hidden />
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#1e2b6e] sm:text-4xl">{t('quote.successTitle')}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-navy/70">{t('quote.successText')}</p>
        </div>
        <article className="mt-8 rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-navy/10 sm:p-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-highlight/20 px-3 py-1 text-xs font-semibold text-[#8a6400]">
            <ClipboardList className="size-3.5" aria-hidden />
            {t('quote.received')}
          </span>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-5 py-3 text-sm font-semibold text-navy"
            >
              {t('quote.backHome')}
            </Link>
            <Link
              href={reservationHref}
              className="inline-flex items-center gap-2 rounded-xl bg-action px-5 py-3 text-sm font-semibold text-white hover:bg-[#0544c4]"
            >
              {t('quote.bookInstead')}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </article>
      </div>
    )
  }

  return (
    <div className="bg-canvas">
      <div className="relative overflow-hidden bg-navy">
        <Image src="/construction.png" alt="" fill sizes="100vw" className="object-cover opacity-40" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071b4b] via-[#071b4b]/88 to-[#071b4b]/35" />
        <div className="relative mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-6 lg:py-10">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-white/75" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">
              {t('nav.home')}
            </Link>
            <span aria-hidden>›</span>
            <span className="text-white">{t('quote.eyebrow')}</span>
          </nav>
          <p className="mt-4 flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-white/80 uppercase">
            <span className="h-0.5 w-8 bg-highlight" aria-hidden />
            {t('quote.eyebrow')}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {t('quote.title')} <span className="text-highlight">{t('quote.titleAccent')}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-white/80">{t('quote.text')}</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-6 lg:pb-20">
        {submitError ? (
          <p className="mb-6 rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent" role="alert">
            {submitError}
          </p>
        ) : null}
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <form
            className="rounded-3xl bg-white p-5 ring-1 ring-navy/10 sm:p-6"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <h2 className="text-xl font-bold text-[#1e2b6e]">{t('quote.formTitle')}</h2>
            <p className="mt-1 text-sm text-navy/60">{t('quote.formText')}</p>
            <div className="mt-5 space-y-4">
              <Field
                icon={User}
                label={t('quote.fullName')}
                error={errors.name?.message}
                registration={register('name', {
                  required: t('form.required'),
                  minLength: { value: 2, message: t('form.min', { count: 2 }) },
                  pattern: { value: namePattern.value, message: t(namePattern.messageKey) },
                })}
                autoComplete="name"
              />
              <Field
                icon={Mail}
                label={t('quote.email')}
                type="email"
                error={errors.email?.message}
                registration={register('email', {
                  required: t('form.required'),
                  pattern: { value: emailPattern.value, message: t(emailPattern.messageKey) },
                })}
                autoComplete="email"
              />
              <Field
                icon={Phone}
                label={t('quote.phone')}
                type="tel"
                required={false}
                error={errors.phone?.message}
                registration={register('phone', {
                  validate: optionalPhoneValidate(t(phonePattern.messageKey)),
                })}
                autoComplete="tel"
              />
              <label className="block text-sm font-semibold text-navy" htmlFor="quote-category">
                {t('quote.category')}
                <span className="text-accent"> *</span>
                <span className="relative mt-1.5 block">
                  <ClipboardList
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy/35"
                    aria-hidden
                  />
                  <select
                    id="quote-category"
                    {...register('category', { required: t('form.select') })}
                    aria-invalid={Boolean(errors.category)}
                    className={`${fieldClassWithIcon} appearance-none ${fieldErrorClass(Boolean(errors.category))}`}
                  >
                    <option value="">{t('quote.categoryPlaceholder')}</option>
                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                    <option value="autre">{t('quote.categoryOther')}</option>
                  </select>
                </span>
                {errors.category ? (
                  <span className="mt-1 block text-xs font-medium text-accent">{errors.category.message}</span>
                ) : null}
              </label>
              <label className="block text-sm font-semibold text-navy" htmlFor="quote-need">
                {t('quote.need')}
                <span className="text-accent"> *</span>
                <textarea
                  id="quote-need"
                  {...register('need', {
                    required: t('form.required'),
                    minLength: { value: 10, message: t('form.min', { count: 10 }) },
                    maxLength: { value: 2000, message: t('form.max', { count: 2000 }) },
                  })}
                  placeholder={t('quote.needPlaceholder')}
                  aria-invalid={Boolean(errors.need)}
                  className={`mt-1.5 min-h-32 w-full rounded-xl border border-navy/10 bg-white px-3 py-3 text-sm font-normal text-navy outline-none focus:border-action ${fieldErrorClass(Boolean(errors.need))}`}
                />
                {errors.need ? <span className="mt-1 block text-xs font-medium text-accent">{errors.need.message}</span> : null}
              </label>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-action px-5 py-3 text-sm font-semibold text-white hover:bg-[#0544c4] disabled:cursor-wait disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('quote.sending') : t('quote.submit')}
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </form>

          <aside className="rounded-3xl bg-white p-5 ring-1 ring-navy/10 sm:p-6">
            <h2 className="text-xl font-bold text-[#1e2b6e]">{t('quote.asideTitle')}</h2>
            <p className="mt-1 text-sm leading-6 text-navy/60">{t('quote.asideText')}</p>
            <ol className="mt-5 space-y-4">
              {[
                [FileText, t('quote.stepReceive')],
                [ClipboardList, t('quote.stepEstimate')],
                [Mail, t('quote.stepReply')],
              ].map(([Icon, label], index) => {
                const StepIcon = Icon as typeof FileText
                return (
                  <li key={String(label)} className="flex items-center gap-3 text-sm font-semibold text-navy">
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-[#eef2fb] text-action">
                      <StepIcon className="size-4" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-xs font-normal text-navy/45">{index + 1}</span>
                      {String(label)}
                    </span>
                  </li>
                )
              })}
            </ol>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Field({
  autoComplete,
  error,
  icon: Icon,
  label,
  registration,
  required = true,
  type = 'text',
}: {
  autoComplete?: string
  error?: string
  icon: LucideIcon
  label: string
  registration: UseFormRegisterReturn
  required?: boolean
  type?: string
}) {
  const id = `quote-${label.replace(/\s+/g, '-').toLowerCase()}`
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
          aria-invalid={Boolean(error)}
          className={`${fieldClassWithIcon} ${fieldErrorClass(Boolean(error))}`}
          {...registration}
        />
      </span>
      {error ? <span className="mt-1 block text-xs font-medium text-accent">{error}</span> : null}
    </label>
  )
}
