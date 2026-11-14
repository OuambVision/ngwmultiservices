'use client'

import { ArrowRight, Check, Mail, MapPin, Phone, Send } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { sendContactMessage } from '@/app/contact/actions'
import { quoteHref, reservationHref } from '@/config/site'
import { emailPattern, fieldClass, fieldErrorClass, namePattern, optionalPhoneValidate, phonePattern } from '@/lib/form-rules'
import type { SiteContact } from '@/lib/site-contact'

type ContactValues = {
  email: string
  message: string
  name: string
  phone: string
}

export function ContactPageView({ contact }: { contact: SiteContact }) {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState('')
  const [sent, setSent] = useState(false)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ContactValues>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: { email: '', message: '', name: '', phone: '' },
  })

  function apiMessage(code: string) {
    if (code === 'email') return t('contact.invalidEmail')
    if (code === 'phone') return t('contact.invalidPhone')
    if (code === 'name') return t('contact.invalidName')
    if (code === 'message') return t('contact.messageShort')
    if (code === 'missing') return t('contact.missing')
    return t('contact.submitError')
  }

  async function onSubmit(values: ContactValues) {
    setSubmitError('')
    const result = await sendContactMessage(values)
    if (!result.ok) {
      setSubmitError(apiMessage(result.message))
      return
    }
    setSent(true)
  }

  return (
    <div className="bg-canvas">
      <div className="mx-auto w-full max-w-[90rem] px-4 pt-10 pb-16 sm:px-6 lg:pt-14 lg:pb-24">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-navy/55" aria-label={t('contact.breadcrumb')}>
          <Link href="/" className="hover:text-action">
            {t('nav.home')}
          </Link>
          <span aria-hidden>/</span>
          <span className="font-medium text-navy">{t('nav.contact')}</span>
        </nav>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-navy/70 uppercase">
              <span className="h-2 w-12 rounded-full bg-highlight" aria-hidden />
              {t('about.eyebrow')}
            </p>
            <h1 className="mt-3 text-xl font-bold tracking-tight text-[#1e2b6e] sm:text-4xl lg:text-5xl">{t('about.title')}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-navy/65 sm:text-lg sm:leading-8 sm:text-navy/75">{t('about.lead')}</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-navy/65">{t('about.text')}</p>

            <div className="mt-8 rounded-3xl bg-white p-5 ring-1 ring-navy/10 sm:p-6">
              <h2 className="text-lg font-bold text-[#1e2b6e]">{t('about.areaTitle')}</h2>
              <p className="mt-2 text-sm leading-6 text-navy/70">{t('about.areaText')}</p>
              <p className="mt-1 text-sm font-semibold text-navy">{contact.area}</p>
            </div>

            <div className="mt-10">
              <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-navy/70 uppercase">
                <span className="h-2 w-12 rounded-full bg-highlight" aria-hidden />
                {t('contact.eyebrow')}
              </p>
              <h2 className="mt-3 text-xl font-bold tracking-tight text-[#1e2b6e] sm:text-3xl">{t('contact.title')}</h2>
              <p className="mt-3 max-w-xl text-navy/70">{t('contact.lead')}</p>
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              <li>
                <a
                  href={contact.phoneHref}
                  className="flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-navy/10 transition hover:ring-action"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-action/10 text-action">
                    <Phone className="size-4" aria-hidden />
                  </span>
                  <span className="mt-3 text-xs font-semibold tracking-wide text-navy/50 uppercase">{t('contact.phone')}</span>
                  <span className="mt-1 text-sm font-bold text-[#1e2b6e]">{contact.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-navy/10 transition hover:ring-action"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-action/10 text-action">
                    <Mail className="size-4" aria-hidden />
                  </span>
                  <span className="mt-3 text-xs font-semibold tracking-wide text-navy/50 uppercase">{t('contact.email')}</span>
                  <span className="mt-1 break-all text-sm font-bold text-[#1e2b6e]">{contact.email}</span>
                </a>
              </li>
              <li className="flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-navy/10">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-action/10 text-action">
                  <MapPin className="size-4" aria-hidden />
                </span>
                <span className="mt-3 text-xs font-semibold tracking-wide text-navy/50 uppercase">{t('contact.area')}</span>
                <span className="mt-1 text-sm font-bold text-[#1e2b6e]">{contact.area}</span>
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={reservationHref}
                className="inline-flex items-center gap-2 rounded-xl bg-action px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0544c4]"
              >
                {t('contact.book')}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href={quoteHref}
                className="inline-flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-action"
              >
                {t('contact.quote')}
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy/10 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-[#1e2b6e] sm:text-2xl">{t('contact.formTitle')}</h2>
            {sent ? (
              <div className="mt-4">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="size-6" strokeWidth={3} aria-hidden />
                </span>
                <p className="mt-3 text-sm leading-6 text-navy/70">
                  <span className="block font-bold text-[#1e2b6e]">{t('contact.successTitle')}</span>
                  {t('contact.successText')}
                </p>
              </div>
            ) : (
              <form className="mt-2" noValidate onSubmit={handleSubmit(onSubmit)}>
                <p className="text-sm leading-6 text-navy/60">{t('contact.formIntro')}</p>
                <label className="mt-4 block text-sm font-semibold text-[#1e2b6e]">
                  {t('contact.name')}
                  <input
                    {...register('name', {
                      required: t('form.required'),
                      minLength: { value: 2, message: t('form.min', { count: 2 }) },
                      pattern: { value: namePattern.value, message: t(namePattern.messageKey) },
                    })}
                    maxLength={80}
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    className={`mt-2 ${fieldClass} ${fieldErrorClass(Boolean(errors.name))}`}
                  />
                  {errors.name ? <span className="mt-1 block text-xs font-medium text-accent">{errors.name.message}</span> : null}
                </label>
                <label className="mt-4 block text-sm font-semibold text-[#1e2b6e]">
                  {t('contact.email')}
                  <input
                    type="email"
                    {...register('email', {
                      required: t('form.required'),
                      pattern: { value: emailPattern.value, message: t(emailPattern.messageKey) },
                    })}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    className={`mt-2 ${fieldClass} ${fieldErrorClass(Boolean(errors.email))}`}
                  />
                  {errors.email ? <span className="mt-1 block text-xs font-medium text-accent">{errors.email.message}</span> : null}
                </label>
                <label className="mt-4 block text-sm font-semibold text-[#1e2b6e]">
                  {t('contact.phone')}
                  <input
                    type="tel"
                    {...register('phone', {
                      validate: optionalPhoneValidate(t(phonePattern.messageKey)),
                    })}
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                    className={`mt-2 ${fieldClass} ${fieldErrorClass(Boolean(errors.phone))}`}
                  />
                  {errors.phone ? <span className="mt-1 block text-xs font-medium text-accent">{errors.phone.message}</span> : null}
                </label>
                <label className="mt-4 block text-sm font-semibold text-[#1e2b6e]">
                  {t('contact.message')}
                  <textarea
                    {...register('message', {
                      required: t('form.required'),
                      minLength: { value: 10, message: t('form.min', { count: 10 }) },
                      maxLength: { value: 1000, message: t('form.max', { count: 1000 }) },
                    })}
                    rows={5}
                    maxLength={1000}
                    placeholder={t('contact.messagePlaceholder')}
                    aria-invalid={Boolean(errors.message)}
                    className={`mt-2 resize-y ${fieldClass} ${fieldErrorClass(Boolean(errors.message))}`}
                  />
                  {errors.message ? (
                    <span className="mt-1 block text-xs font-medium text-accent">{errors.message.message}</span>
                  ) : null}
                </label>
                {submitError ? (
                  <p className="mt-3 rounded-xl bg-accent/10 px-3 py-2 text-sm font-medium text-accent" role="alert">
                    {submitError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-action px-4 py-3 text-sm font-semibold text-white hover:bg-[#0544c4] disabled:opacity-70"
                >
                  <Send className="size-4" aria-hidden />
                  {isSubmitting ? t('contact.sending') : t('contact.submit')}
                </button>
              </form>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
