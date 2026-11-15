import type { Access, FieldAccess, PayloadRequest } from 'payload'

export type UserWithRole = {
  id?: number | string
  role?: string | null
}

export function userRole(req: PayloadRequest): string | null {
  const user = req.user as UserWithRole | null | undefined
  return user?.role ?? null
}

export function isSuperAdmin(req: PayloadRequest): boolean {
  return userRole(req) === 'super-admin'
}

export function isAdminPanelUser(req: PayloadRequest): boolean {
  const role = userRole(req)
  // Legacy accounts without role keep panel access during migration.
  return role == null || role === 'super-admin' || role === 'admin'
}

/**
 * Any signed-in account. Separating what each role can read is step 16.
 * Until then, the admin panel itself stays limited to administrators.
 */
export const staff: Access = ({ req }) => Boolean(req.user)

export const anyone: Access = () => true

export const adminPanel = ({ req }: { req: PayloadRequest }): boolean => {
  if (!req.user) return false
  return isAdminPanelUser(req)
}

export const superAdminOnly: Access = ({ req }) => isSuperAdmin(req)

/** Users collection: super-admin sees all; admin sees only self. */
export const usersRead: Access = ({ req }) => {
  const user = req.user as UserWithRole | null | undefined
  if (!user?.id) return false
  if (isSuperAdmin(req)) return true
  if (user.role === 'admin') return { id: { equals: user.id } }
  return false
}

/** Users collection: super-admin updates anyone; admin updates only self. */
export const usersUpdate: Access = ({ req }) => {
  const user = req.user as UserWithRole | null | undefined
  if (!user?.id) return false
  if (isSuperAdmin(req)) return true
  if (user.role === 'admin') return { id: { equals: user.id } }
  return false
}

/** Only super-admin can create/delete users or change the role field. */
export const usersCreate: Access = ({ req }) => isSuperAdmin(req)
export const usersDelete: Access = ({ req }) => isSuperAdmin(req)

export const roleFieldAccess: FieldAccess = ({ req }) => isSuperAdmin(req)

export function publicReadEquals(field: string, value: boolean | string): Access {
  return ({ req }) => {
    if (req.user) return true
    return { [field]: { equals: value } }
  }
}

export const staffField: FieldAccess = ({ req }) => Boolean(req.user)
