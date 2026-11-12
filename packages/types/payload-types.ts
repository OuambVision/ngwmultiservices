/** Placeholder until `pnpm generate:types`. Do not edit by hand. */

export interface User {
  id: string
  email: string
  updatedAt: string
  createdAt: string
}

export interface Media {
  id: string
  alt?: string | null
  url?: string | null
  filename?: string | null
  updatedAt: string
  createdAt: string
}

export interface Config {
  collections: {
    users: User
    media: Media
  }
  collectionsJoins: Record<string, never>
  collectionsSelect: Record<string, never>
  globals: Record<string, never>
  globalsSelect: Record<string, never>
  locale: null
  user: User
  jobs: {
    tasks: unknown
    workflows: unknown
  }
}
