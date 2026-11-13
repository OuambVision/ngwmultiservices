'use client'

import { Calendar, Mail, MapPin, Menu, Phone, User, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Logo } from '@/components/site/logo'
import { clientSpaceHref, mainNav, reservationHref, site } from '@/config/site'
import { isLocale, localeCookie, localeMaxAge, type Locale } from '@/i18n/locale'
import type { SiteContact } from '@/lib/site-contact'
import { cn } from '@/lib/utils'

function writeLocale(locale: Locale) {
  document.cookie = `${localeCookie}=${locale}; Path=/; Max-Age=${localeMaxAge}; SameSite=Lax`
  window.localStorage.setItem(localeCookie, locale)
  document.documentElement.lang = locale
}

function HeaderTools({ locale, onToggleLocale }: { locale: Locale; onToggleLocale: () => void }) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const otherLocale = locale === 'fr' ? 'EN' : 'FR'

  return (
    <div className="flex items-center gap-1">
      <Link
        href={clientSpaceHref}
        aria-current={isCurrent(pathname, clientSpaceHref) ? 'page' : undefined}
        aria-label={t('header.clientSpace')}
        className="inline-flex size-10 items-center justify-center rounded-full text-navy hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
      >
        <User className="size-5" aria-hidden />
      </Link>
      <button
        type="button"
        onClick={onToggleLocale}
        aria-label={locale === 'fr' ? t('header.showEnglish') : t('header.showFrench')}
        className="inline-flex h-10 items-center rounded-md px-2 text-sm font-semibold tracking-wide text-navy hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
      >
        {otherLocale}
      </button>
    </div>
  )
}

function isCurrent(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Header({ contact }: { contact: SiteContact }) {
  const pathname = usePathname()
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const locale: Locale = i18n.language === 'en' ? 'en' : 'fr'
  const synced = useRef(false)

  useEffect(() => {
    if (synced.current) return
    synced.current = true
    const saved = window.localStorage.getItem(localeCookie)
    if (isLocale(saved) && saved !== locale) {
      writeLocale(saved)
      void i18n.changeLanguage(saved)
      router.refresh()
    }
  }, [i18n, locale, router])

  function toggleLocale() {
    const next: Locale = locale === 'fr' ? 'en' : 'fr'
    writeLocale(next)
    void i18n.changeLanguage(next)
    router.refresh()
  }

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <>
    <div className="border-b border-action/15 bg-[#e4edfd] text-navy">
      <ul className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-center gap-x-8 gap-y-1 px-4 py-2 text-sm sm:px-6">
        <li>
          <a
            href={contact.phoneHref}
            aria-label={t('header.phone', { value: contact.phoneDisplay })}
            className="inline-flex items-center gap-2 rounded-sm hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
          >
            <Phone className="size-4 shrink-0 text-action" aria-hidden />
            <span>{contact.phoneDisplay}</span>
          </a>
        </li>
        <li>
          <a
            href={`mailto:${contact.email}`}
            aria-label={t('header.email', { value: contact.email })}
            className="inline-flex items-center gap-2 rounded-sm hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
          >
            <Mail className="size-4 shrink-0 text-action" aria-hidden />
            <span>{contact.email}</span>
          </a>
        </li>
        <li className="inline-flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-action" aria-hidden />
          <span>{contact.area}</span>
        </li>
      </ul>
    </div>
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action"
        >
          <span className="sr-only">{t('header.home', { name: site.name })}</span>
          <Logo priority="header" />
        </Link>

        <nav className="ml-auto hidden items-center gap-6 lg:flex" aria-label={t('nav.main')}>
          {mainNav.map((item) => {
            const current = isCurrent(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'border-b-2 pb-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action',
                  current ? 'border-accent text-accent' : 'border-transparent text-navy',
                )}
              >
                {t(item.labelKey)}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:ml-0 lg:flex">
          {/* <a
            href={site.phoneHref}
            className="inline-flex items-center gap-2 rounded-full border border-action px-4 py-2 text-sm font-semibold text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
          >
            <Phone className="size-4" aria-hidden />
            {site.phoneDisplay}
          </a> */}
          <Link
            href={reservationHref}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            <Calendar className="size-4" aria-hidden />
            {t('header.book')}
          </Link>
          <HeaderTools locale={locale} onToggleLocale={toggleLocale} />
        </div>

        <Link
          href={reservationHref}
          className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold whitespace-nowrap text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy lg:hidden"
        >
          <Calendar className="size-4" aria-hidden />
          <span className="max-sm:sr-only">{t('header.bookShort')}</span>
        </Link>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-lg border border-navy/15 text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? t('header.closeMenu') : t('header.openMenu')}</span>
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      {open ? (
        <nav
          id="menu-mobile"
          className="border-t border-navy/10 bg-white px-4 py-4 lg:hidden"
          aria-label={t('nav.mobile')}
        >
          <ul className="flex flex-col gap-1">
            {mainNav.map((item) => {
              const current = isCurrent(pathname, item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? 'page' : undefined}
                    className={cn(
                      'block rounded-lg px-3 py-3 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action',
                      current ? 'bg-canvas text-accent' : 'text-navy',
                    )}
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              )
            })}
          </ul>
          <HeaderTools locale={locale} onToggleLocale={toggleLocale} />
          <div className="mt-4 flex flex-col gap-3">
            <a
              href={contact.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-action px-4 py-3 font-semibold text-action"
            >
              <Phone className="size-4" aria-hidden />
              {contact.phoneDisplay}
            </a>
            <Link
              href={reservationHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-semibold text-white"
            >
              <Calendar className="size-4" aria-hidden />
              {t('header.bookLong')}
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
    </>
  )
}
