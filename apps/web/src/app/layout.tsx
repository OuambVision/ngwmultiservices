import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { BackToTop } from '@/components/site/back-to-top'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { InstallAppPrompt } from '@/components/site/install-app-prompt'
import { site } from '@/config/site'
import { getLocale, getT } from '@/i18n/server'
import { loadSiteContact } from '@/lib/site-contact'
import { GeistMono, GeistSans } from '@/lib/fonts'
import { Providers } from '@/providers'

import './globals.css'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#071b4b' },
    { media: '(prefers-color-scheme: dark)', color: '#071b4b' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return {
    applicationName: site.name,
    title: {
      default: site.name,
      template: `%s — ${site.name}`,
    },
    description: t('meta.description'),
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      title: 'NGW',
      statusBarStyle: 'default',
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/icons/icon-512.png', type: 'image/png', sizes: '512x512' },
        { url: '/icon.png', type: 'image/png', sizes: '256x256' },
      ],
      shortcut: '/icons/icon-192.png',
      apple: [{ url: '/apple-icon.png', type: 'image/png', sizes: '180x180' }],
    },
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [contact, locale, t] = await Promise.all([loadSiteContact(), getLocale(), getT()])

  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${GeistMono.variable} scroll-smooth motion-reduce:scroll-auto`}
    >
      <body className="flex min-h-screen flex-col bg-canvas font-sans text-navy antialiased">
        <Providers locale={locale}>
          <a
            href="#contenu"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-navy"
          >
            {t('skip')}
          </a>
          <Header contact={contact} />
          <main id="contenu" className="flex-1">
            {children}
          </main>
          <Footer contact={contact} />
          <BackToTop />
          <InstallAppPrompt />
        </Providers>
      </body>
    </html>
  )
}
