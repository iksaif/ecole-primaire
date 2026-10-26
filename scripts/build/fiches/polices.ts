// Polices des fiches PDF : les @font-face d'Andika (police scolaire du site, OFL), embarqués dans chaque document en
// data: URL (le navigateur de rendu n'a ni serveur ni accès à node_modules) ; ceux de Marelle (cursive libre de l'Éducation nationale,
// OFL, variantes comprises) et de Playwrite FR Trad (OFL) dans les documents qui s'en servent (affiche de l'alphabet : l'attaché). Les PDF
// publiés sont en Marelle (décision du 2026-10-26, après Playwrite FR Trad le 2026-10-06) ; les polices non redistribuables (Belle Allure,
// Écolier) ne sont jamais embarquées.
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

/** Les polices cursives livrées : leur famille CSS et leur fichier (les webfonts officiels de Marelle, non modifiés, et Playwrite FR Trad). */
const FICHIERS_ATTACHE = [
  { famille: 'Marelle', fichier: 'src/assets/fonts/marelle/Marelle-Regular.woff2' },
  { famille: 'Marelle 2', fichier: 'src/assets/fonts/marelle/Marelle2-Regular.woff2' },
  { famille: 'Marelle Baton', fichier: 'src/assets/fonts/marelle/MarelleBaton-Regular.woff2' },
  { famille: 'Marelle Baton 2', fichier: 'src/assets/fonts/marelle/MarelleBaton2-Regular.woff2' },
  { famille: 'Playwrite FR Trad', fichier: 'node_modules/@fontsource/playwrite-fr-trad/files/playwrite-fr-trad-latin-400-normal.woff2' },
]

/** Les @font-face des cursives que le document nomme (l'attaché) et qu'il n'embarque pas déjà, calculés une fois par police. */
const cssAttache = new Map<string, string>()
export function cssPoliceAttache(contenu: string): string {
  return FICHIERS_ATTACHE.filter(({ famille }) => (contenu.includes(`'${famille}'`) || contenu.includes(`"${famille}"`)) && !contenu.includes(`@font-face { font-family: '${famille}'`)).map(({ famille, fichier }) => {
    if (!cssAttache.has(famille)) cssAttache.set(famille, `@font-face { font-family: '${famille}'; font-weight: 400; src: url(${dataUrl(join(racine, fichier), 'font/woff2')}) format('woff2'); }`)
    return cssAttache.get(famille)
  }).join('\n')
}

/**
 * Donne à `documentImpression` (affiches) les @font-face d'Andika, et ceux des cursives livrées (Marelle et ses variantes, Playwrite FR Trad)
 * que le document nomme : comme le fait src/utils/impression.js dans le navigateur.
 */
export function installerPolices(): void {
  fournirPolices(contenu => {
    const attache = cssPoliceAttache(contenu)
    return `${cssPoliceScolaire()}${attache ? `\n${attache}` : ''}`
  })
}
