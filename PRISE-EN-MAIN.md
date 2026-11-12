# Prise en main — ngwmultiservices

Projet vierge. Les dossiers, les dépendances et les noms de variables sont en place. Le code métier (pages, collections, paiements, authentification externe) reste à écrire.

## Prérequis

- Node.js 20 ou plus
- pnpm 9 (`corepack enable` puis `corepack prepare pnpm@9.0.0 --activate` si la commande `pnpm` est absente)
- PostgreSQL 16, en local ou hébergé
- Docker, seulement si vous utilisez le `docker-compose.yml` fourni

## 1. Installer

À la racine du projet :

```bash
pnpm install
```

## 2. Base de données

Avec Docker :

```bash
docker compose up -d
```

Cela crée la base `ngwmultiservices`, utilisateur `postgres`, mot de passe `postgres`, port `5432`.

Sans Docker, créez une base vide du même nom sur votre serveur Postgres.

## 3. Remplir les variables

Les fichiers existent déjà. Les valeurs sont vides. Ne commitez jamais un `.env`.

| Fichier | Rôle |
| --- | --- |
| `backend/api/.env` | Secrets de l’API, Postgres, services externes |
| `apps/web/.env` | Ce que le navigateur a le droit de voir |

### Minimum pour démarrer en local

Dans `backend/api/.env` :

```bash
PAYLOAD_SECRET=<chaine-longue-aleatoire>
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/ngwmultiservices
POSTGRES_SSL=false
```

`POSTGRES_SSL` vide ou `false` : pas de SSL (Postgres local). `POSTGRES_SSL=true` : SSL avec certificat non vérifié, pour une base hébergée.

Les URL peuvent rester vides en local. Le code retombe alors sur :

- API : `http://localhost:3000`
- REST : `http://localhost:3000/api`
- Site : `http://localhost:3001`

Pour les écrire quand même :

```bash
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_PAYLOAD_API_URL=http://localhost:3000/api
NEXT_PUBLIC_CLIENT_URL=http://localhost:3001
```

Dans `apps/web/.env` :

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_SHOP_NAME=
NEXT_PUBLIC_SHOP_EMAIL=
```

`NEXT_PUBLIC_API_URL` inclut `/api`, sans slash final.

Générez `PAYLOAD_SECRET` et, plus tard, `PREVIEW_SECRET` et `INTERNAL_AUTH_SECRET` avec une longue chaîne aléatoire. Ne les réutilisez pas d’un autre projet.

### Variables déjà nommées, à remplir quand la fonction existe

- Cloudinary : `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET`
- Google : `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `GOOGLE_REGISTER_CALLBACK_URL`, `INTERNAL_AUTH_SECRET`
- Mail : `NODEMAILER_EMAIL_USERNAME`, `NODEMAILER_EMAIL_APP_PASSWORD`
- Stripe : `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOKS_SIGNING_SECRET`
- Identité et SEO : `COMPANY_NAME`, `SITE_NAME`, `TWITTER_CREATOR`, `TWITTER_SITE`, `WEBSITE_URL`, `NEXT_PUBLIC_SHOP_NAME`, `NEXT_PUBLIC_SHOP_EMAIL`, `TAXES_RATE`
- Plusieurs origines autorisées, séparées par des virgules : `CLIENT_URLS`
- Preview Payload : `PREVIEW_SECRET`
- Hébergement Vercel : `NEXT_PUBLIC_VERCEL_URL`

Les paquets npm correspondants sont installés. Aucun n’est activé dans `backend/api/src/plugins/index.ts` ni dans `payload.config.ts`.

## 4. Démarrer

```bash
pnpm dev
```

| URL | Rôle |
| --- | --- |
| http://localhost:3000 | Page d’accueil de l’API |
| http://localhost:3000/admin | Admin Payload. Au premier passage, créez le premier utilisateur |
| http://localhost:3000/api | REST Payload |
| http://localhost:3001 | Site public, encore vide |

Commandes séparées :

```bash
pnpm dev:api
pnpm dev:web
```

Le site a besoin que l’API réponde. `pnpm dev` lance les deux.

Autres commandes :

```bash
pnpm build
pnpm lint
pnpm check-types
pnpm generate:types
pnpm --filter ngwmultiservices-api generate:importmap
pnpm --filter ngwmultiservices-api test:int
```

`generate:importmap` régénère `backend/api/src/app/(payload)/admin/importMap.js` après l’ajout d’un composant admin personnalisé. À lancer si l’admin signale un composant absent de l’import map.

`generate:types` régénère les types Payload et les copie dans `@repo/types`. À lancer après chaque changement de collection ou de global.

En production, le site écoute `PORT` (défaut 3001) via `node ./start.mjs`. L’API écoute le port 3000.

## 5. Où écrire la suite

| Besoin | Dossier |
| --- | --- |
| Pages du site | `apps/web/src` |
| Collections, access, hooks, globals | `backend/api/src` |
| Route HTTP hors REST Payload (mail, OAuth, paiement) | `backend/api/src/app/api` |
| Appel de cette route depuis le site | `packages/api/services`, puis export dans `packages/api/index.ts` |
| Hook React Query | `packages/api/hooks` |
| État global (Zustand) | `packages/stores` |
| Fonctions pures partagées | `packages/utils` |
| Ports et URL par défaut | `packages/config` |

Le site importe déjà ces relais :

- `@/app/(app)/services` → `@repo/api`
- `@/app/(app)/hooks` → `@repo/api/hooks`
- `@/app/(app)/store` → `@repo/stores`
- `@/lib/utils` → `@repo/utils`

Les chemins Axios sont relatifs à `baseURL` (`/users`, pas `/api/users`). Les cookies de session partent avec `withCredentials: true`. L’origine du site doit rester dans `cors` et `csrf` de Payload (`NEXT_PUBLIC_CLIENT_URL`).

Le middleware `backend/api/src/middleware.ts` ne couvre que `/api/custom/*`, pour ne pas doubler les en-têtes CORS du REST Payload. Ajoutez-y vos propres préfixes quand vous créez une route custom.

Les médias restent sur le disque (`backend/api/public/media`) tant que Cloudinary n’est pas branché.

## 6. Brancher un service

Dans `backend/api/src/plugins/index.ts`, ajoutez le plugin au tableau, puis remplissez les variables. Exemple SEO, une fois qu’une collection de pages existe :

```ts
import { seoPlugin } from '@payloadcms/plugin-seo'

export const plugins: Plugin[] = [
  seoPlugin({
    collections: ['pages'],
    uploadsCollection: 'media',
  }),
]
```

Mail, dans `payload.config.ts`, avec `@payloadcms/email-nodemailer` : `nodemailerAdapter`, transport SMTP, utilisateur et mot de passe d’application lus dans `NODEMAILER_*`.

Cloudinary : `@payloadcms/plugin-cloud-storage` et le paquet `cloudinary`, sur la collection `media`, avec `disableLocalStorage: true`.

Stripe : `@payloadcms/plugin-ecommerce` et les trois variables `STRIPE_*`. Le script `pnpm --filter ngwmultiservices-api stripe-webhooks` suppose le CLI Stripe, qui transfère vers `localhost:3000/api/stripe/webhooks`.

Google : routes à créer sous `backend/api/src/app/api/auth/google`. Le callback reste sur l’API (port 3000). `GOOGLE_CALLBACK_URL` doit correspondre à l’URL déclarée chez Google.

Après un plugin qui ajoute des champs ou des collections : `pnpm generate:types`, puis `pnpm --filter ngwmultiservices-api generate:importmap`.

## Ce qui n’est pas dans ce dépôt

Pas de collections métier, pas de pages de boutique, pas de thème graphique, pas de seed, pas de secrets. Les tests d’intégration sont un fichier témoin. Les tests Playwright (`test:e2e`) n’ont pas encore de scénario : les lancer télécharge un navigateur et démarre l’API, donc seulement une fois Postgres et `PAYLOAD_SECRET` en place.
