'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'

import { createI18n } from '@/i18n/client'
import type { Locale } from '@/i18n/locale'

export function Providers({ children, locale }: { children: ReactNode; locale: Locale }) {
  const [queryClient] = useState(() => new QueryClient())
  const [i18n] = useState(() => createI18n(locale))
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </I18nextProvider>
  )
}
