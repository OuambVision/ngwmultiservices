import { createInstance, type TFunction } from 'i18next'
import { cookies, headers } from 'next/headers'

import { localeCookie, resolveLocale, type Locale } from './locale'
import { resources } from './messages'

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const headerStore = await headers()
  return resolveLocale(cookieStore.get(localeCookie)?.value, headerStore.get('accept-language'))
}

export async function getT(): Promise<TFunction> {
  const locale = await getLocale()
  const instance = createInstance()
  await instance.init({
    lng: locale,
    fallbackLng: 'fr',
    resources,
    interpolation: { escapeValue: false },
  })
  return instance.getFixedT(locale)
}
