export const bookingStatuses = [
  { label: 'Brouillon', value: 'brouillon' },
  { label: 'En attente', value: 'en_attente' },
  { label: 'Reçue', value: 'recue' },
  { label: 'À estimer', value: 'a_estimer' },
  { label: 'Devis envoyé', value: 'devis_envoye' },
  { label: 'Acceptée', value: 'acceptee' },
  { label: 'Confirmée', value: 'confirmee' },
  { label: 'En cours', value: 'en_cours' },
  { label: 'Terminée', value: 'terminee' },
  { label: 'Annulée', value: 'annulee' },
  { label: 'Non disponible', value: 'non_disponible' },
  { label: 'Litige', value: 'litige' },
] as const

export const quoteStatuses = [
  { label: 'Reçue', value: 'recue' },
  { label: 'En traitement', value: 'en_traitement' },
  { label: 'Traitée', value: 'traitee' },
  { label: 'Annulée', value: 'annulee' },
] as const

export const reviewStatuses = [
  { label: 'En attente', value: 'en_attente' },
  { label: 'Publié', value: 'publie' },
  { label: 'Refusé', value: 'refuse' },
] as const

export const userRoles = [
  { label: 'Administrateur', value: 'admin' },
  { label: 'Client', value: 'client' },
  { label: 'Employé', value: 'employe' },
  { label: 'Partenaire', value: 'partenaire' },
  { label: 'Gestionnaire immobilier', value: 'gestionnaire_immobilier' },
] as const
