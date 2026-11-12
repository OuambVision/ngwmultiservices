import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { fr } from '@payloadcms/translations/languages/fr'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Users } from './collections/Users'
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
  serverURL: SERVER_URL,
  cors: trustedOrigins,
  csrf: trustedOrigins,
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— ngwmultiservices',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
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
