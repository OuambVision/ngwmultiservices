import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { site } from '@/config/site'
import { GeistMono, GeistSans } from '@/lib/fonts'
import { Providers } from '@/providers'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  description: site.description,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-canvas font-sans text-navy antialiased">
        <Providers>
          <a
            href="#contenu"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-navy"
          >
            Aller au contenu
          </a>
          <Header />
          <main id="contenu" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
