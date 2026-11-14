'use client'

import { ArrowLeft, ArrowRight, Calendar, Check, Clock, MapPin, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { clientSpaceHref } from '@/config/site'
import {
  reservationReceiptKey,
  type ReservationReceipt,
} from '@/components/site/reservation-types'

export function ReservationConfirmation({ reference }: { reference: string }) {
  const { t } = useTranslation()
  const [receipt, setReceipt] = useState<ReservationReceipt | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(reservationReceiptKey)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as ReservationReceipt
      if (parsed.reference === reference) setReceipt(parsed)
    } catch {
      setReceipt(null)
    }
  }, [reference])

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="text-center">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="size-8" strokeWidth={3} aria-hidden />
        </span>
        <h1 className="mt-5 text-xl font-bold tracking-tight text-[#1e2b6e] sm:text-3xl lg:text-4xl">
          {t('reservation.confirmTitle')}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-navy/70">{t('reservation.confirmText')}</p>
      </div>

      <article className="mt-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy/10 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#1e2b6e]">{t('reservation.details')}</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-highlight/20 px-3 py-1 text-xs font-semibold text-[#8a6400]">
            <Clock className="size-3.5" aria-hidden />
            {t('reservation.pending')}
          </span>
        </div>
        {reference ? (
          <p className="mt-2 text-sm text-navy/60">
            {t('reservation.reference')} : <span className="font-semibold text-navy">{reference}</span>
          </p>
        ) : null}
        {receipt ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-[9rem_minmax(0,1fr)]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-canvas sm:aspect-square">
              <Image src={receipt.image} alt={receipt.imageAlt} fill className="object-cover" sizes="160px" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1e2b6e]">{receipt.serviceTitle}</h3>
              {receipt.summary ? <p className="mt-1 text-sm text-navy/65">{receipt.summary}</p> : null}
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-navy/50">{t('reservation.categoryLabel')}</dt>
                  <dd className="font-semibold text-navy">{receipt.categoryTitle}</dd>
                </div>
                <div className="flex gap-2">
                  <Calendar className="mt-0.5 size-4 text-action" aria-hidden />
                  <span>
                    <span className="block text-navy/50">{t('reservation.dateLabel')}</span>
                    <span className="font-semibold text-navy">{receipt.dateLabel}</span>
                  </span>
                </div>
                {receipt.place ? (
                  <div className="flex gap-2">
                    <MapPin className="mt-0.5 size-4 text-action" aria-hidden />
                    <span>
                      <span className="block text-navy/50">{t('reservation.placeLabel')}</span>
                      <span className="font-semibold text-navy">{receipt.place}</span>
                    </span>
                  </div>
                ) : null}
                {receipt.price ? (
                  <div className="flex gap-2">
                    <Tag className="mt-0.5 size-4 text-action" aria-hidden />
                    <span>
                      <span className="block text-navy/50">{t('reservation.priceLabel')}</span>
                      <span className="font-semibold text-navy">
                        {t('services.from')} {receipt.price}
                      </span>
                    </span>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>
        ) : null}
      </article>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-navy/15 bg-white px-5 py-3 text-sm font-semibold text-navy"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t('reservation.backHome')}
        </Link>
        <Link
          href={clientSpaceHref}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-action px-5 py-3 text-sm font-semibold text-white hover:bg-[#0544c4]"
        >
          {t('reservation.myBookings')}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
