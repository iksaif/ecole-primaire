// Importe les icônes de src/images/icones.ts dans src/images/donnees/icones.ts : le contenu SVG de chaque icône Phosphor, en bold, et
// en fill pour celles de REMPLIES. Les fichiers de la version ci-dessous sont téléchargés une fois dans un cache hors du dépôt ; le
// site, lui, ne fait aucune requête. Échoue si une icône n'existe pas. À relancer quand on ajoute une icône à icones.ts.
//   node scripts/generer/icones.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ICONES, REMPLIES } from '../../src/images/icones.ts'

const VERSION = 'v2.0.8'
const CACHE = join(import.meta.dirname, '../../node_modules/.cache/phosphor', VERSION)
const SORTIE = join(import.meta.dirname, '../../src/images/donnees/icones.ts')

type Graisse = 'bold' | 'fill'

/** Le fichier SVG d'une icône dans une graisse, téléchargé si le cache ne l'a pas encore. */
async function charger(phosphor: string, graisse: Graisse): Promise<string> {
  mkdirSync(join(CACHE, graisse), { recursive: true })
  const fichier = join(CACHE, graisse, `${phosphor}.svg`)
  if (existsSync(fichier)) return readFileSync(fichier, 'utf8')
  const reponse = await fetch(`https://raw.githubusercontent.com/phosphor-icons/core/${VERSION}/assets/${graisse}/${phosphor}-${graisse}.svg`)
  if (!reponse.ok) throw new Error(`Phosphor ${VERSION} n'a pas l'icône ${phosphor} (${graisse})`)
  const svg = await reponse.text()
  writeFileSync(fichier, svg)
  return svg
}

/** Le contenu du <svg> sans l'enveloppe (cadre 256 × 256, couleur héritée : currentColor). */
function interieur(phosphor: string, svg: string): string {
  if (!svg.includes('viewBox="0 0 256 256"')) throw new Error(`${phosphor} : cadre inattendu (viewBox 0 0 256 256 attendu)`)
  if (/url\(#|\sid="/.test(svg)) throw new Error(`${phosphor} : identifiant ou renvoi, à traiter avant de l'intégrer`)
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/>\s+</g, '><').trim()
}

const lignes = (table: Record<string, string>): string => Object.entries(table).map(([nom, dessin]) => `  '${nom}': '${dessin}',`).join('\n')

const bold: Record<string, string> = {}
const fill: Record<string, string> = {}
for (const [nom, phosphor] of Object.entries(ICONES)) {
  bold[nom] = interieur(phosphor, await charger(phosphor, 'bold'))
  if (REMPLIES.includes(nom as keyof typeof ICONES)) fill[nom] = interieur(phosphor, await charger(phosphor, 'fill'))
}
writeFileSync(SORTIE, `// GÉNÉRÉ par scripts/generer/icones.ts d'après src/images/icones.ts : ne pas modifier à la main.
// Icônes Phosphor ${VERSION} (https://phosphoricons.com), licence MIT : contenu SVG d'un cadre 256 × 256, couleur héritée.
export const BOLD: Readonly<Record<string, string>> = {
${lignes(bold)}
}

export const FILL: Readonly<Record<string, string>> = {
${lignes(fill)}
}
`)
console.log(`${Object.keys(bold).length} icônes (bold), ${Object.keys(fill).length} pleines, écrites dans src/images/donnees/icones.ts`)
