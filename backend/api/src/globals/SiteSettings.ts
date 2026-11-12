import type { GlobalConfig } from 'payload'

import { anyone, staff } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  label: 'Réglages du site',
  admin: { group: 'Site' },
  access: {
    read: anyone,
    update: staff,
  },
  fields: [
    { name: 'phone', label: 'Téléphone', type: 'text', defaultValue: '613-698-2837' },
    {
      name: 'email',
      label: 'Courriel',
      type: 'email',
      defaultValue: 'ngwmultiservice@gmail.com',
    },
    { name: 'area', label: 'Zone desservie', type: 'text', defaultValue: 'Ottawa et environs' },
    { name: 'homeTitle', label: 'Titre d’accueil', type: 'text' },
    { name: 'homeIntro', label: 'Texte court d’accueil', type: 'textarea' },
  ],
}
