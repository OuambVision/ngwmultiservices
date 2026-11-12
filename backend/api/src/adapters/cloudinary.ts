import path from 'path'
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import type { Adapter, File } from '@payloadcms/plugin-cloud-storage/types'

const FOLDER = 'ngwmultiservices'

type CloudinaryResourceType = 'image' | 'video' | 'raw'

function ensureCloudinary(): void {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME
  const api_key = process.env.CLOUDINARY_API_KEY
  const api_secret = process.env.CLOUDINARY_API_SECRET

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      'Cloudinary n’est pas configuré. Renseignez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET.',
    )
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  })
}

function resourceTypeFromMime(mimeType: string): CloudinaryResourceType {
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('image/')) return 'image'
  return 'raw'
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function normalizeResourceType(value: unknown, fallback: CloudinaryResourceType): CloudinaryResourceType {
  if (value === 'image' || value === 'video' || value === 'raw') return value
  return fallback
}

function publicIdFor(filename: string, resourceType: CloudinaryResourceType, folder = FOLDER): string {
  const assetName = resourceType === 'raw' ? filename : path.parse(filename).name
  return folder ? `${folder}/${assetName}` : assetName
}

function deliveryUrl(filename: string, publicId: string, resourceType: CloudinaryResourceType): string {
  const format = path.extname(filename).replace(/^\./, '')

  return cloudinary.url(publicId, {
    secure: true,
    resource_type: resourceType,
    force_version: false,
    urlAnalytics: false,
    ...(resourceType !== 'raw' && format ? { format } : {}),
  })
}

function uploadBuffer(file: File, folder: string): Promise<UploadApiResponse> {
  ensureCloudinary()

  const resourceType = resourceTypeFromMime(file.mimeType)
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: resourceType === 'raw' ? file.filename : path.parse(file.filename).name,
        resource_type: resourceType,
        overwrite: true,
        unique_filename: false,
        use_filename: false,
        filename_override: file.filename,
        invalidate: true,
        ...(uploadPreset ? { upload_preset: uploadPreset } : {}),
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Échec de l’envoi vers Cloudinary.'))
          return
        }
        resolve(result)
      },
    )

    stream.end(file.buffer)
  })
}

export const cloudinaryAdapter: Adapter = ({ prefix }) => {
  const folder = prefix || FOLDER

  return {
    name: 'cloudinary',
    fields: [
      {
        name: 'cloudinaryPublicId',
        type: 'text',
        admin: {
          hidden: true,
          readOnly: true,
        },
      },
      {
        name: 'cloudinaryResourceType',
        type: 'text',
        admin: {
          hidden: true,
          readOnly: true,
        },
      },
    ],
    handleUpload: async ({ data, file }) => {
      const result = await uploadBuffer(file, folder)
      const isOriginal = file.filename === data.filename

      if (isOriginal) {
        data.cloudinaryPublicId = result.public_id
        data.cloudinaryResourceType = result.resource_type
      }
    },
    handleDelete: async ({ doc, filename }) => {
      ensureCloudinary()

      const stored = doc as typeof doc & {
        cloudinaryPublicId?: string | null
        cloudinaryResourceType?: string | null
      }
      const fallbackType = resourceTypeFromMime(readString(doc.mimeType) || 'application/octet-stream')
      const isOriginal = filename === doc.filename
      const resourceType = isOriginal
        ? normalizeResourceType(stored.cloudinaryResourceType, fallbackType)
        : fallbackType
      const publicId =
        (isOriginal && readString(stored.cloudinaryPublicId)) || publicIdFor(filename, resourceType, folder)

      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      })
    },
    generateURL: ({ data, filename, prefix: filePrefix }) => {
      ensureCloudinary()

      const targetFolder = filePrefix || folder
      const fallbackType = resourceTypeFromMime(readString(data?.mimeType) || 'application/octet-stream')
      const isOriginal = filename === data?.filename
      const resourceType = isOriginal
        ? normalizeResourceType(data?.cloudinaryResourceType, fallbackType)
        : fallbackType
      const publicId =
        (isOriginal && readString(data?.cloudinaryPublicId)) ||
        publicIdFor(filename, resourceType, targetFolder)

      return deliveryUrl(filename, publicId, resourceType)
    },
    staticHandler: async (_req, { params }) => {
      ensureCloudinary()

      const filename = params.filename
      const resourceType: CloudinaryResourceType = /\.(mp4|webm|mov|m4v|avi)$/i.test(filename)
        ? 'video'
        : /\.(jpe?g|png|gif|webp|svg|avif|bmp|tiff?)$/i.test(filename)
          ? 'image'
          : 'raw'
      const url = deliveryUrl(filename, publicIdFor(filename, resourceType, folder), resourceType)

      return Response.redirect(url, 302)
    },
  }
}
