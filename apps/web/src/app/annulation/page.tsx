import type { Metadata } from 'next'
import Link from 'next/link'

import { getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('legal.cancelMeta') }
}

export default async function CancellationPage() {
  const t = await getT()
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-navy/70 uppercase">
        <span className="h-2 w-12 rounded-full bg-highlight" aria-hidden />
        {t('legal.cancelEyebrow')}
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#1e2b6e]">{t('legal.cancelTitle')}</h1>
      <p className="mt-4 text-lg text-navy/70">{t('legal.cancelLead')}</p>
      <p className="mt-8 rounded-2xl bg-white px-5 py-6 text-sm leading-7 text-navy/70 ring-1 ring-navy/10">
        {t('legal.cancelDraft')}
      </p>
      <p className="mt-8">
        <Link href="/contact" className="inline-flex text-sm font-semibold text-action hover:underline">
          {t('legal.cancelContact')}
        </Link>
      </p>
    </article>
  )
}
