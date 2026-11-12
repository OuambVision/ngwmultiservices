import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

import { staff } from '../access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Média', plural: 'Médias' },
  admin: { group: 'Contenu' },
  access: {
    create: staff,
    read: staff,
    update: staff,
    delete: staff,
  },
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
  },
  fields: [
    {
      name: 'alt',
      label: 'Texte alternatif',
      type: 'text',
    },
  ],
}
