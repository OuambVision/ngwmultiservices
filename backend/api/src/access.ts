import type { Access, FieldAccess, PayloadRequest } from 'payload'

type UserWithRole = {
  role?: string | null
}

/**
 * Any signed-in account. Separating what each role can read is step 16.
 * Until then, the admin panel itself stays limited to administrators.
 */
export const staff: Access = ({ req }) => Boolean(req.user)

export const anyone: Access = () => true

export const adminPanel = ({ req }: { req: PayloadRequest }): boolean => {
  const user = req.user as UserWithRole | null | undefined
  if (!user) return false
  return user.role == null || user.role === 'admin'
}

export function publicReadEquals(field: string, value: boolean | string): Access {
  return ({ req }) => {
    if (req.user) return true
    return { [field]: { equals: value } }
  }
}

export const staffField: FieldAccess = ({ req }) => Boolean(req.user)
