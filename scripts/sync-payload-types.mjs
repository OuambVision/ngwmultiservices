import { readFileSync, writeFileSync } from 'node:fs'

const source = readFileSync('backend/api/src/payload-types.ts', 'utf8')
const shared = source.replace(/\r?\n*declare module 'payload' \{\r?\n[\s\S]*?\r?\n\}\s*$/, '\n')

writeFileSync('packages/types/payload-types.ts', shared)
console.log('Synced payload-types to @repo/types')
