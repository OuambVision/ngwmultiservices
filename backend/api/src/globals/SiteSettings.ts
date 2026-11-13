import type { GlobalConfig } from 'payload'

import { anyone, staff } from '../access'
import { fillHeroImageUrls } from '../hooks/heroImages'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  label: 'Réglages du site',
  admin: { group: 'Site' },
  access: {
    read: anyone,
    update: staff,
  },
  hooks: {
    beforeChange: [fillHeroImageUrls],
  },
  fields: [
    { name: 'phone', label: 'Téléphone', type: 'text', defaultValue: '613-698-2837' },
    {
      name: 'email',
      label: 'Courriel',
      type: 'email',
      defaultValue: 'ngwmultiservice@gmail.com',
    },
    { name: 'area', label: 'Zone desservie', type: 'text', localized: true, defaultValue: 'Ottawa et environs' },
    { name: 'homeTitle', label: 'Titre d’accueil', type: 'text', localized: true },
    { name: 'homeIntro', label: 'Texte court d’accueil', type: 'textarea', localized: true },
    {
      name: 'heroImages',
      label: 'Images du bandeau',
      type: 'array',
      labels: { singular: 'Image', plural: 'Images' },
      admin: {
        description:
          'Ces images défilent dans le bandeau d’accueil, dans cet ordre. L’adresse publique est enregistrée automatiquement.',
      },
      fields: [
        {
          name: 'image',
          label: 'Image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'url',
          label: 'Adresse publique',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Utilisée par le site. Elle se met à jour quand l’image change.',
          },
        },
      ],
    },
  ],
}
