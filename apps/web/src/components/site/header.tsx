'use client'

import { Calendar, Mail, MapPin, Menu, Phone, User, X } from 'lucide-react'
import Image from 'next/image'
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
  const otherLocale = locale === 'fr' ? 'EN' : 'FR'

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
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <>
      <div className="hidden border-b border-action/15 bg-[#e4edfd] text-navy sm:block">
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
        <div className="mx-auto flex max-w-screen-2xl items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
          <Link
            href="/"
            className="min-w-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action"
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
            <Link
              href={reservationHref}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              <Calendar className="size-4" aria-hidden />
              {t('header.book')}
            </Link>
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
              onClick={toggleLocale}
              aria-label={locale === 'fr' ? t('header.showEnglish') : t('header.showFrench')}
              className="inline-flex h-10 items-center rounded-md px-2 text-sm font-semibold tracking-wide text-navy hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
            >
              {otherLocale}
            </button>
          </div>

          <Link
            href={reservationHref}
            className="ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-accent px-2.5 text-xs font-semibold whitespace-nowrap text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:h-10 sm:gap-2 sm:rounded-lg sm:px-3 sm:text-sm lg:hidden"
          >
            <Calendar className="size-3.5 sm:size-4" aria-hidden />
            <span className="max-sm:sr-only">{t('header.bookShort')}</span>
          </Link>
          <button
            type="button"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-navy/15 text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action sm:size-10 sm:rounded-lg lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? t('header.closeMenu') : t('header.openMenu')}</span>
            {open ? <X className="size-3.5 sm:size-4.5" aria-hidden /> : <Menu className="size-3.5 sm:size-4.5" aria-hidden />}
          </button>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label={t('header.closeMenu')}
          className={cn(
            'absolute inset-0 bg-navy/45 transition-opacity duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            open ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setOpen(false)}
        />
        <nav
          id="menu-mobile"
          aria-label={t('nav.mobile')}
          className={cn(
            'absolute inset-y-0 right-0 flex w-[min(20.5rem,88vw)] flex-col overflow-hidden shadow-[-12px_0_40px_rgba(7,27,75,0.22)] will-change-transform transition-transform duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <Image
            src="/construction.png"
            alt=""
            fill
            sizes="22rem"
            className="object-cover"
            aria-hidden
          />
          <div className="absolute inset-0 bg-navy/78" aria-hidden />

          <div className="relative z-10 flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-white/15 px-4 py-3">
              <p className="text-sm font-semibold text-white">{site.name}</p>
              <button
                type="button"
                className="inline-flex size-10 items-center justify-center rounded-lg text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
                onClick={() => setOpen(false)}
              >
                <span className="sr-only">{t('header.closeMenu')}</span>
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <ul className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
              {mainNav.map((item) => {
                const current = isCurrent(pathname, item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={current ? 'page' : undefined}
                      className={cn(
                        'block rounded-xl px-3 py-3.5 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight',
                        current ? 'bg-white/95 text-accent' : 'text-white hover:bg-white/10',
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {t(item.labelKey)}
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="mt-auto space-y-3 border-t border-white/15 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <a
                href={contact.phoneHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-highlight px-4 py-3 text-sm font-semibold text-highlight"
              >
                <Phone className="size-4" aria-hidden />
                {contact.phoneDisplay}
              </a>
              <Link
                href={reservationHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                <Calendar className="size-4" aria-hidden />
                {t('header.bookLong')}
              </Link>
              <div className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-2xl bg-white/12 p-2 ring-1 ring-white/20 backdrop-blur-sm">
                <Link
                  href={clientSpaceHref}
                  aria-label={t('header.clientSpace')}
                  className="inline-flex min-w-0 items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
                  onClick={() => setOpen(false)}
                >
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-canvas text-navy">
                    <User className="size-4" aria-hidden />
                  </span>
                  <span className="truncate">{t('header.clientSpace')}</span>
                </Link>
                <button
                  type="button"
                  onClick={toggleLocale}
                  aria-label={locale === 'fr' ? t('header.showEnglish') : t('header.showFrench')}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl bg-white px-3.5 text-sm font-bold tracking-wide text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
                >
                  {otherLocale}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}
