import type { CollectionConfig } from 'payload'

import {
  adminPanel,
  roleFieldAccess,
  usersCreate,
  usersDelete,
  usersRead,
  usersUpdate,
} from '../access'
import { userRoles } from '../domain/statuses'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  admin: {
    useAsTitle: 'email',
    group: 'Administration',
    defaultColumns: ['email', 'role'],
  },
  auth: true,
  access: {
    admin: adminPanel,
    create: usersCreate,
    read: usersRead,
    update: usersUpdate,
    delete: usersDelete,
  },
  fields: [
    {
      name: 'role',
      label: 'Rôle',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      saveToJWT: true,
      options: [...userRoles],
      access: {
        create: roleFieldAccess,
        update: roleFieldAccess,
      },
      admin: {
        description:
          'Super administrateur : tous les droits. Administrateur : tout sauf la gestion des autres utilisateurs.',
      },
    },
  ],
}
