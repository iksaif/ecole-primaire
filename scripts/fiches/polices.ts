// Polices des fiches PDF : les @font-face d'Andika (police scolaire du site, OFL), embarqués dans chaque document en
// data: URL (le navigateur de rendu n'a ni serveur ni accès à node_modules).
// Les polices locales non redistribuables (polices-locales/) de l'ancien build ne sont pas reprises pour l'instant.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fournirPolices } from '../../src/utils/page.ts'

const racine = join(import.meta.dirname, '..', '..')
const dataUrl = (fichier: string, mime: string): string => `data:${mime};base64,${readFileSync(fichier).toString('base64')}`

const FICHIERS_ANDIKA = [
  { poids: 400, fichier: 'node_modules/@fontsource/andika/files/andika-latin-400-normal.woff2' },
  { poids: 700, fichier: 'node_modules/@fontsource/andika/files/andika-latin-700-normal.woff2' },
]

/** Le CSS des @font-face de la police scolaire (calculé une fois : les data: URL pèsent ≈ 40 Ko). */
let cssAndika: string | null = null
export function cssPoliceScolaire(): string {
  cssAndika ??= FICHIERS_ANDIKA.map(({ poids, fichier }) =>
    `@font-face { font-family: 'Andika'; font-weight: ${poids}; src: url(${dataUrl(join(racine, fichier), 'font/woff2')}) format('woff2'); }`).join('\n')
  return cssAndika
}

/** Donne à `documentImpression` (affiches) les @font-face d'Andika, comme le fait src/utils/impression.js dans le navigateur. */
export function installerPolices(): void {
  fournirPolices(() => cssPoliceScolaire())
}
