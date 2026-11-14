'use client'

import { Link, useConfig } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'

/** Lien vers le tableau de bord, placé au-dessus des groupes de collections. */
export function DashboardNavLink() {
  const { config } = useConfig()
  const pathname = usePathname()
  const href = config.routes.admin || '/admin'
  const normalized = pathname?.replace(/\/$/, '') || ''
  const adminRoot = href.replace(/\/$/, '')
  const active = normalized === adminRoot

  return (
    <Link
      className={`nav__link ngw-dashboard-nav${active ? ' active' : ''}`}
      href={href}
      aria-current={active ? 'page' : undefined}
    >
      {active ? <span className="nav__link-indicator" aria-hidden /> : null}
      <span className="nav__label">Tableau de bord</span>
    </Link>
  )
}
