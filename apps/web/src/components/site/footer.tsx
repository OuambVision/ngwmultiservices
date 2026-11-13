import { Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

import { Logo } from '@/components/site/logo'
import { mainNav, serviceFamilies, site } from '@/config/site'
import { getT } from '@/i18n/server'
import type { SiteContact } from '@/lib/site-contact'

export async function Footer({ contact }: { contact: SiteContact }) {
  const t = await getT()

  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-screen-2xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/75">
            {site.legalName}. {t('meta.description')}
          </p>
        </div>

        <nav aria-label={t('nav.footer')}>
          <h2 className="text-sm font-semibold">{t('footer.quick')}</h2>
          <ul className="mt-4 space-y-2">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-white/80 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t('nav.families')}>
          <h2 className="text-sm font-semibold">{t('footer.services')}</h2>
          <ul className="mt-4 space-y-2">
            {serviceFamilies.map((item) => (
              <li key={item.labelKey}>
                <Link
                  href={item.href}
                  className="text-sm text-white/80 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold">{t('footer.contact')}</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li>
              <a href={contact.phoneHref} className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
                <Phone className="size-4 shrink-0" aria-hidden />
                {contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
              >
                <Mail className="size-4 shrink-0" aria-hidden />
                {contact.email}
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden />
              <span>
                {site.locality}
                <span className="block">{contact.area}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-screen-2xl px-4 py-4 text-xs text-white/60 sm:px-6">
          © {new Date().getFullYear()} {site.legalName}. {t('footer.rights')}
        </p>
      </div>
    </footer>
  )
}
