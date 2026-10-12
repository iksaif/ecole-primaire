// Les pictogrammes des consignes (src/images/consignes.ts, lexique VERBES) : chaque pictogramme ARASAAC (Sergio Palao, CC BY-NC-SA),
// en couleur et en « nocolor » (le style contour), est téléchargé une fois dans un cache hors du dépôt
// (node_modules/.cache/arasaac), réduit à 200 px (12 mm à l'impression, ~400 dpi) et encodé en WebP par Chrome, puis écrit en
// adresses `data:` dans src/images/donnees/pictogrammes.ts. Le site ne fait aucune requête vers ARASAAC. Licence : on place et on
// redimensionne, on ne modifie pas le dessin (brouillons/iconographie/LICENCE-FICHES.md).
//
//   node scripts/generer/pictogrammes.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { VERBES } from '../../src/images/consignes.ts'
import { trouverChrome } from '../../tests/outils.mjs'

const CACHE = join(import.meta.dirname, '../../node_modules/.cache/arasaac')
const SORTIE = join(import.meta.dirname, '../../src/images/donnees/pictogrammes.ts')
const COTE = 200
const QUALITE_WEBP = 0.8

/** Le PNG de 500 px d'un pictogramme (`suffixe` : '' en couleur, '_nocolor' sans couleur), téléchargé si le cache ne l'a pas. */
async function chargerPng(numero: number, suffixe: string): Promise<Buffer> {
  mkdirSync(CACHE, { recursive: true })
  const nom = `${numero}${suffixe}_500.png`
  const fichier = join(CACHE, nom)
  if (existsSync(fichier)) return readFileSync(fichier)
  const reponse = await fetch(`https://static.arasaac.org/pictograms/${numero}/${nom}`)
  if (!reponse.ok) throw new Error(`ARASAAC n'a pas le pictogramme ${nom} (${reponse.status})`)
  const png = Buffer.from(await reponse.arrayBuffer())
  writeFileSync(fichier, png)
  return png
}

const navigateur = await chromium.launch({ executablePath: trouverChrome() })
const page = await navigateur.newPage()

/** Le PNG réduit à COTE px sur fond blanc et encodé en WebP, en adresse `data:` (dessiné par Chrome dans un canvas). */
async function enWebp(png: Buffer): Promise<string> {
  const source = `data:image/png;base64,${png.toString('base64')}`
  return page.evaluate(async ({ source, cote, qualite }) => {
    const image = new Image()
    image.src = source
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = cote
    canvas.height = cote
    const contexte = canvas.getContext('2d')
    if (!contexte) throw new Error('canvas 2d indisponible')
    contexte.fillStyle = '#fff'
    contexte.fillRect(0, 0, cote, cote)
    contexte.drawImage(image, 0, 0, cote, cote)
    return canvas.toDataURL('image/webp', qualite)
  }, { source, cote: COTE, qualite: QUALITE_WEBP })
}

const lignes: string[] = []
for (const [verbe, numero] of Object.entries(VERBES)) {
  const couleur = await enWebp(await chargerPng(numero, ''))
  const contour = await enWebp(await chargerPng(numero, '_nocolor'))
  lignes.push(`  // ${verbe}`, `  '${numero}': {`, `    couleur: '${couleur}',`, `    contour: '${contour}',`, '  },')
}
await navigateur.close()

const contenu = `// FICHIER GÉNÉRÉ par scripts/generer/pictogrammes.ts : ne pas le modifier à la main.
// Pictogrammes ARASAAC (https://arasaac.org), auteur Sergio Palao, licence CC BY-NC-SA 4.0 ; réduits à ${COTE} px, en WebP.
// Chargé à la demande (chargerPictogrammes, src/images/useImagesFiche.ts) : seulement quand une fiche montre ses pictogrammes.
import type { ImagesPictogramme } from '../consignes.ts'

export const PICTOGRAMMES: Readonly<Record<string, ImagesPictogramme>> = {
${lignes.join('\n')}
}
`
writeFileSync(SORTIE, contenu)
const ko = Math.round(Buffer.byteLength(contenu) / 1024)
console.log(`${Object.keys(VERBES).length} pictogrammes écrits dans src/images/donnees/pictogrammes.ts (${ko} Ko)`)
