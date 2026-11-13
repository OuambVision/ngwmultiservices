import { createInstance, type i18n } from 'i18next'
import { initReactI18next } from 'react-i18next'

import type { Locale } from './locale'
import { resources } from './messages'

export function createI18n(locale: Locale): i18n {
  const instance = createInstance()
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: 'fr',
    resources,
    interpolation: { escapeValue: false },
  })
  return instance
}
