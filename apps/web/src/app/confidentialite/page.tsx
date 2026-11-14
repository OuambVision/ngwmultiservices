import type { Metadata } from 'next'
import Link from 'next/link'

import { getT } from '@/i18n/server'
import { loadSiteContact } from '@/lib/site-contact'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('legal.privacyMeta') }
}

export default async function PrivacyPage() {
  const t = await getT()
  const contact = await loadSiteContact()
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-navy/70 uppercase">
        <span className="h-2 w-12 rounded-full bg-highlight" aria-hidden />
        {t('legal.privacyEyebrow')}
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#1e2b6e]">{t('legal.privacyTitle')}</h1>
      <p className="mt-4 text-lg text-navy/70">{t('legal.privacyLead')}</p>
      <section className="mt-10 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-[#1e2b6e]">{t('legal.privacyCollectTitle')}</h2>
          <p className="mt-2 text-sm leading-7 text-navy/70">{t('legal.privacyCollect')}</p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1e2b6e]">{t('legal.privacyUseTitle')}</h2>
          <p className="mt-2 text-sm leading-7 text-navy/70">{t('legal.privacyUse')}</p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1e2b6e]">{t('legal.privacyKeepTitle')}</h2>
          <p className="mt-2 text-sm leading-7 text-navy/70">{t('legal.privacyKeep', { email: contact.email })}</p>
        </div>
      </section>
      <p className="mt-10">
        <Link href="/contact" className="text-sm font-semibold text-action hover:underline">
          {t('nav.contact')}
        </Link>
      </p>
    </article>
  )
}
