import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type { Plugin } from 'payload'

import { cloudinaryAdapter } from '../adapters/cloudinary'

const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
)

/**
 * SEO, ecommerce and form builder stay disabled until a collection uses them.
 * Cloudinary is enabled as soon as the three credentials are present.
 */
export const plugins: Plugin[] = [
  cloudStoragePlugin({
    enabled: cloudinaryEnabled,
    collections: {
      media: {
        adapter: cloudinaryAdapter,
        disableLocalStorage: true,
        disablePayloadAccessControl: true,
      },
    },
  }),
]
