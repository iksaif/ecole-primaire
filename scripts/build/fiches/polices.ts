// Polices des fiches PDF : les @font-face d'Andika (police scolaire du site, OFL), embarqués dans chaque document en
// data: URL (le navigateur de rendu n'a ni serveur ni accès à node_modules) ; ceux de Playwrite FR Trad (cursive, OFL) dans
// les documents qui s'en servent (affiche de l'alphabet : l'attaché). Décision du 2026-10-06 : les PDF publiés restent en
// Playwrite FR Trad ; les polices non redistribuables (Belle Allure, Écolier) ne sont jamais embarquées.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fournirPolices } from '../../../src/utils/page.ts'
import { racine } from '../../lib/racine.ts'
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

/** Les @font-face de Playwrite FR Trad (l'attaché), calculés une fois. */
let cssAttache: string | null = null
export function cssPoliceAttache(): string {
  cssAttache ??= `@font-face { font-family: 'Playwrite FR Trad'; font-weight: 400; src: url(${dataUrl(join(racine, 'node_modules/@fontsource/playwrite-fr-trad/files/playwrite-fr-trad-latin-400-normal.woff2'), 'font/woff2')}) format('woff2'); }`
  return cssAttache
}

/**
 * Donne à `documentImpression` (affiches) les @font-face d'Andika, et ceux de Playwrite FR Trad si le document la nomme :
 * comme le fait src/utils/impression.js dans le navigateur.
 */
export function installerPolices(): void {
  fournirPolices(contenu => `${cssPoliceScolaire()}${contenu.includes('Playwrite FR Trad') ? `\n${cssPoliceAttache()}` : ''}`)
}
