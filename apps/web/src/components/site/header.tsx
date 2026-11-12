'use client'

import { Calendar, Menu, Phone, User, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Logo } from '@/components/site/logo'
import { clientSpaceHref, mainNav, reservationHref, site } from '@/config/site'
import { cn } from '@/lib/utils'

function HeaderTools({
  locale,
  onToggleLocale,
}: {
  locale: 'fr' | 'en'
  onToggleLocale: () => void
}) {
  const pathname = usePathname()
  const otherLocale = locale === 'fr' ? 'EN' : 'FR'

  return (
    <div className="flex items-center gap-1">
      <Link
        href={clientSpaceHref}
        aria-current={isCurrent(pathname, clientSpaceHref) ? 'page' : undefined}
        aria-label="Espace client"
        className="inline-flex size-10 items-center justify-center rounded-full text-navy hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
      >
        <User className="size-5" aria-hidden />
      </Link>
      <button
        type="button"
        onClick={onToggleLocale}
        aria-label={locale === 'fr' ? 'Afficher le site en anglais' : 'Afficher le site en français'}
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

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [locale, setLocale] = useState<'fr' | 'en'>('fr')

  useEffect(() => {
    const saved = window.localStorage.getItem('ngw-locale')
    if (saved === 'en' || saved === 'fr') {
      setLocale(saved)
      document.documentElement.lang = saved
    }
  }, [])

  function toggleLocale() {
    const next = locale === 'fr' ? 'en' : 'fr'
    setLocale(next)
    document.documentElement.lang = next
    window.localStorage.setItem('ngw-locale', next)
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
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action"
        >
          <span className="sr-only">{site.name}, retour à l’accueil</span>
          <Logo priority="header" />
        </Link>

        <nav
          className="ml-auto hidden items-center gap-6 lg:flex"
          aria-label="Navigation principale"
        >
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
                {item.label}
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
            Réserver un service
          </Link>
          <HeaderTools locale={locale} onToggleLocale={toggleLocale} />
        </div>

        <Link
          href={reservationHref}
          className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold whitespace-nowrap text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy lg:hidden"
        >
          <Calendar className="size-4" aria-hidden />
          <span className="max-sm:sr-only">Rendez-vous</span>
        </Link>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-lg border border-navy/15 text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      {open ? (
        <nav
          id="menu-mobile"
          className="border-t border-navy/10 bg-white px-4 py-4 lg:hidden"
          aria-label="Navigation mobile"
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
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
          <HeaderTools locale={locale} onToggleLocale={toggleLocale} />
          <div className="mt-4 flex flex-col gap-3">
            <a
              href={site.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-action px-4 py-3 font-semibold text-action"
            >
              <Phone className="size-4" aria-hidden />
              {site.phoneDisplay}
            </a>
            <Link
              href={reservationHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-semibold text-white"
            >
              <Calendar className="size-4" aria-hidden />
              Prendre rendez-vous
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
