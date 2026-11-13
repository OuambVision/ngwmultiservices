import { API_URL } from '@repo/api'
import type { SiteSetting } from '@repo/types'

import { site } from '@/config/site'
import { withLocale } from '@/i18n/locale'
import { getLocale } from '@/i18n/server'

export type SiteContact = {
  area: string
  email: string
  phoneDisplay: string
  phoneHref: string
}

function phoneHref(display: string) {
  const digits = display.replace(/\D/g, '')
  if (digits.length === 10) return `tel:+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `tel:+${digits}`
  return digits ? `tel:+${digits}` : site.phoneHref
}

export async function loadSiteContact(): Promise<SiteContact> {
  const locale = await getLocale()
  let settings: SiteSetting | null = null
  try {
    const response = await fetch(`${API_URL}${withLocale('/globals/siteSettings', locale)}`, {
      cache: 'no-store',
    })
    if (response.ok) settings = (await response.json()) as SiteSetting
  } catch {
    settings = null
  }

  const phoneDisplay = settings?.phone?.trim() || site.phoneDisplay
  return {
    area: settings?.area?.trim() || site.area,
    email: settings?.email?.trim() || site.email,
    phoneDisplay,
    phoneHref: phoneHref(phoneDisplay),
  }
}
