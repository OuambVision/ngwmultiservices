import { Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

import { Logo } from '@/components/site/logo'
import { mainNav, serviceFamilies, site } from '@/config/site'

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-screen-2xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/75">
            {site.legalName}. {site.description}
          </p>
        </div>

        <nav aria-label="Liens de pied de page">
          <h2 className="text-sm font-semibold">Liens rapides</h2>
          <ul className="mt-4 space-y-2">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-white/80 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Familles de services">
          <h2 className="text-sm font-semibold">Nos services</h2>
          <ul className="mt-4 space-y-2">
            {serviceFamilies.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-white/80 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold">Contactez-nous</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li>
              <a href={site.phoneHref} className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
                <Phone className="size-4 shrink-0" aria-hidden />
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
              >
                <Mail className="size-4 shrink-0" aria-hidden />
                {site.email}
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden />
              <span>
                {site.locality}
                <span className="block">{site.area}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-screen-2xl px-4 py-4 text-xs text-white/60 sm:px-6">
          © {new Date().getFullYear()} {site.legalName}. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}
