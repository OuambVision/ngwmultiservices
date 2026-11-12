import type { CollectionConfig } from 'payload'

import { adminPanel, staff } from '../access'
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
    create: staff,
    read: staff,
    update: staff,
    delete: staff,
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
      admin: {
        description: 'Les espaces client, employé, partenaire et immobilier s’ouvrent plus tard.',
      },
    },
  ],
}
