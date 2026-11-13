export const locales = ['fr', 'en'] as const
export type Locale = (typeof locales)[number]
export const localeCookie = 'ngw-locale'
export const localeMaxAge = 60 * 60 * 24 * 365

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'fr' || value === 'en'
}

export function resolveLocale(cookie: string | undefined, acceptLanguage: string | null): Locale {
  if (isLocale(cookie)) return cookie
  const preferred = acceptLanguage?.split(',')[0]?.trim().toLowerCase() ?? ''
  return preferred.startsWith('en') ? 'en' : 'fr'
}

export function withLocale(path: string, locale: Locale) {
  const joiner = path.includes('?') ? '&' : '?'
  return `${path}${joiner}locale=${locale}&fallback-locale=fr`
}
