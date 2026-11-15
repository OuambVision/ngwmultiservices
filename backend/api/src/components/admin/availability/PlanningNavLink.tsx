'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useConfig } from '@payloadcms/ui'

export function PlanningNavLink() {
  const pathname = usePathname()
  const { config } = useConfig()
  const adminRoot = (config.routes.admin || '/admin').replace(/\/$/, '')
  const href = `${adminRoot}/planning`
  const active = pathname === href || pathname?.startsWith(`${href}/`)

  return (
    <a
      className={`nav__link ${active ? 'active' : ''}`}
      href={href}
      style={
        active
          ? undefined
          : {
              color: 'var(--theme-elevation-800)',
            }
      }
    >
      <span className="nav__link-label">Planning</span>
    </a>
  )
}
