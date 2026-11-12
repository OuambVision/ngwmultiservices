import { ValidationError, type PayloadRequest } from 'payload'

type SubmissionData = {
  consent?: unknown
  reference?: unknown
  status?: unknown
}

type SubmissionArgs = {
  data?: SubmissionData
  operation: 'create' | 'update'
  req: PayloadRequest
}

export function forcePublicStatus(status: string) {
  return ({ data, operation, req }: SubmissionArgs) => {
    if (operation === 'create' && !req.user && data) data.status = status
    return data
  }
}

export function requirePublicConsent({ data, operation, req }: SubmissionArgs) {
  if (operation === 'create' && !req.user && data?.consent !== true) {
    throw new ValidationError({
      collection: 'reviews',
      errors: [
        {
          message: 'L’acceptation de la vérification est requise.',
          path: 'consent',
        },
      ],
      req,
    })
  }
  return data
}
