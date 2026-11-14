import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { fr } from '@payloadcms/translations/languages/fr'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Availability } from './collections/Availability'
import { Bookings } from './collections/Bookings'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { QuoteRequests } from './collections/QuoteRequests'
import { Realizations } from './collections/Realizations'
import { Reviews } from './collections/Reviews'
import { Services } from './collections/Services'
import { Users } from './collections/Users'
import { submitContact } from './endpoints/submitContact'
import { SiteSettings } from './globals/SiteSettings'
import { plugins } from './plugins'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  'http://localhost:3000'

function parseOrigins(...values: Array<string | undefined>): string[] {
  return [
    ...new Set(
      values
        .flatMap((value) => (value ? value.split(',') : []))
        .map((value) => value.trim().replace(/\/$/, ''))
        .filter(Boolean),
    ),
  ]
}

const trustedOrigins = parseOrigins(
  process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3001',
  process.env.CLIENT_URLS,
  SERVER_URL,
)

export default buildConfig({
  i18n: {
    supportedLanguages: { fr },
    fallbackLanguage: 'fr',
  },
  localization: {
    locales: [
      { label: 'Français', code: 'fr' },
      { label: 'Anglais', code: 'en' },
    ],
    defaultLocale: 'fr',
    fallback: true,
  },
  serverURL: SERVER_URL,
  cors: trustedOrigins,
  csrf: trustedOrigins,
  admin: {
    user: Users.slug,
    theme: 'light',
    meta: {
      titleSuffix: '— NGW MULTISERVICES',
      description: 'Administration NGW MULTISERVICES',
      icons: [
        { rel: 'icon', type: 'image/png', sizes: '192x192', url: '/icons/icon-192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', url: '/icons/icon-512.png' },
        { rel: 'apple-touch-icon', type: 'image/png', url: '/apple-icon.png' },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      providers: [
        '/components/admin/InstallableAdmin#InstallableAdmin',
        '/components/admin/KeepNavDocked#KeepNavDocked',
      ],
      graphics: {
        Logo: '/components/admin/Logo',
        Icon: '/components/admin/Icon',
      },
      actions: [
        '/components/admin/HeaderSearch#HeaderSearch',
        '/components/admin/HeaderNotifications#HeaderNotifications',
      ],
      views: {
        dashboard: {
          Component: '/components/admin/dashboard/NgwDashboard#NgwDashboard',
        },
      },
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Services,
    Availability,
    Bookings,
    QuoteRequests,
    Realizations,
    Reviews,
  ],
  globals: [SiteSettings],
  endpoints: [submitContact],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
      ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    },
  }),
  editor: lexicalEditor(),
  plugins,
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
