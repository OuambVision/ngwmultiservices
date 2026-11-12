import { PagePlaceholder } from '@/components/site/page-placeholder'

export default function NotFound() {
  return (
    <PagePlaceholder
      eyebrow="404"
      title="Cette page n’existe pas."
      description="Le lien est incorrect ou la page n’a pas encore été publiée. Revenez à l’accueil depuis le menu."
    />
  )
}