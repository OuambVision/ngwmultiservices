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
import { renderResetPasswordEmail } from '../lib/email/bookingTemplate'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  admin: {
    useAsTitle: 'email',
    group: 'Administration',
    defaultColumns: ['email', 'role'],
  },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    forgotPassword: {
      /** Lien valable 1 heure. */
      expiration: 1000 * 60 * 60,
      generateEmailSubject: () => 'Réinitialisation de votre mot de passe — NGW MULTISERVICES',
      generateEmailHTML: (args) => {
        const req = args?.req
        const token = args?.token ?? ''
        const user = args?.user
        const config = req?.payload?.config
        const configuredServerURL =
          typeof config?.serverURL === 'string' && config.serverURL.trim() ? config.serverURL.trim() : ''
        let serverURL = configuredServerURL
        if (!serverURL && req?.url) {
          try {
            const incoming = new URL(req.url)
            const host = req.headers?.get?.('host') || incoming.host
            serverURL = `${incoming.protocol}//${host}`
          } catch {
            serverURL = ''
          }
        }
        if (!serverURL) {
          serverURL =
            process.env.NEXT_PUBLIC_SERVER_URL ||
            process.env.PAYLOAD_PUBLIC_SERVER_URL ||
            'http://localhost:3000'
        }
        const adminRoute = (config?.routes?.admin || '/admin').replace(/\/$/, '')
        const resetPath = (config?.admin?.routes?.reset || '/reset').replace(/\/$/, '')
        const url = `${serverURL.replace(/\/$/, '')}${adminRoute}${resetPath}/${token}`
        const email = typeof user?.email === 'string' ? user.email : 'votre compte'
        return renderResetPasswordEmail(url, email)
      },
    },
  },
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
