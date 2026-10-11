// Importe les emojis de src/images/tables.ts dans src/images/donnees/ : un module par style (couleur.ts, contour.ts), un dessin SVG par
// code, nettoyé (sans identifiants ni espaces inutiles). OpenMoji : les fichiers en couleur de la version ci-dessous, téléchargés une fois
// dans un cache hors du dépôt. Dessins maison (`maison:<nom>`) : src/images/maison/<nom>.svg, dans le dépôt. Le contour est déduit de la
// couleur (contourDe), pour les deux sources : un dessin maison peut le remplacer par <nom>.contour.svg. Le site, lui, ne fait aucune
// requête. Échoue si un code n'existe pas ou si un dessin maison n'a pas le cadre 72 × 72. À relancer quand on ajoute un emoji à
// tables.ts ou qu'on modifie un dessin maison.
//   node scripts/generer/images.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { EMOJIS } from '../../src/images/tables.ts'
import type { StyleImages } from '../../src/images/preference.ts'
import { chargerOpenMoji, ligneDessin, nettoyer, VERSION_OPENMOJI } from './openmoji.ts'
const SORTIE = join(import.meta.dirname, '../../src/images/donnees')
const MAISON = join(import.meta.dirname, '../../src/images/maison')
const PREFIXE_MAISON = 'maison:'

/** Pour chaque style : le module écrit et le nom de sa table. */
const STYLES: Record<StyleImages, { table: string, description: string }> = {
  couleur: { table: 'COULEUR', description: 'couleur' },
  contour: { table: 'CONTOUR', description: 'contour noir sur blanc, à colorier, déduit de la couleur' },
}

/** Le fichier SVG d'un dessin maison, qui doit avoir le cadre des OpenMoji (72 × 72). */
function lireMaison(fichier: string, nom: string): string {
  if (!existsSync(fichier)) throw new Error(`dessin maison absent : src/images/maison/${nom}`)
  const svg = readFileSync(fichier, 'utf8')
  if (!svg.includes('viewBox="0 0 72 72"')) throw new Error(`src/images/maison/${nom} : le cadre doit être viewBox="0 0 72 72"`)
  return svg
}

/** Une couleur qui reste au contour : noir (yeux, traits), blanc, ou rien. */
const resteAuContour = (couleur: string): boolean => /^(none|#000|#000000|black|#fff|#ffffff|white)$/i.test(couleur)

/**
 * Le contour d'un dessin, déduit de sa version en couleur : tout aplat et tout trait de couleur devient blanc, le noir reste noir. Les
 * traits noirs d'OpenMoji (le calque « line ») restent donc seuls visibles, sur un intérieur blanc et opaque : un objet posé devant un
 * autre le cache, comme en couleur (les « black » d'OpenMoji sont transparents : le mur se verrait à travers le chat). Un bras dessiné
 * en trait noir épais recouvert d'un trait de peau plus fin reste un bras.
 */
function contourDe(svg: string): string {
  return svg.replace(/<([a-z]+)\b([^>]*?)(\/?)>/g, (balise, nom: string, attributs: string, fin: string) => {
    const remplissage = /\sfill="([^"]*)"/.exec(attributs)?.[1]
    const trait = /\sstroke="([^"]*)"/.exec(attributs)?.[1]
    const remplissageColore = remplissage !== undefined && !resteAuContour(remplissage)
    let nouveaux = attributs
    if (remplissageColore) nouveaux = nouveaux.replace(/\sfill="[^"]*"/, ' fill="#fff"')
    if (trait !== undefined && !resteAuContour(trait)) nouveaux = nouveaux.replace(/\sstroke="[^"]*"/, ' stroke="#fff"')
    return `<${nom}${nouveaux}${fin}>`
  })
}

/** Un dessin maison dans un style : en contour, `<nom>.contour.svg` s'il existe (retouche à la main), sinon le contour déduit. */
function chargerMaison(code: string, style: StyleImages): string {
  const nom = code.slice(PREFIXE_MAISON.length)
  const couleur = lireMaison(join(MAISON, `${nom}.svg`), `${nom}.svg`)
  if (style === 'couleur') return couleur
  const retouche = join(MAISON, `${nom}.contour.svg`)
  if (existsSync(retouche)) return lireMaison(retouche, `${nom}.contour.svg`)
  return contourDe(couleur)
}

mkdirSync(SORTIE, { recursive: true })
const codes = [...new Set(Object.values(EMOJIS))].sort()
/** Un emoji dans un style : maison (couleur, retouche ou contour déduit), ou OpenMoji (couleur, ou son contour déduit). */
async function charger(code: string, style: StyleImages): Promise<string> {
  if (code.startsWith(PREFIXE_MAISON)) return chargerMaison(code, style)
  const couleur = await chargerOpenMoji(code)
  return style === 'couleur' ? couleur : contourDe(couleur)
}

for (const [style, { table, description }] of Object.entries(STYLES) as [StyleImages, typeof STYLES[StyleImages]][]) {
  const dessins: string[] = []
  for (const code of codes) {
    const svg = await charger(code, style)
    dessins.push(ligneDessin(code, nettoyer(code, svg)))
  }
  writeFileSync(join(SORTIE, `${style}.ts`), `// GÉNÉRÉ par scripts/generer/images.ts d'après src/images/tables.ts : ne pas modifier à la main.
// Dessins SVG des emojis OpenMoji ${VERSION_OPENMOJI} (${description}), CC BY-SA 4.0 — https://openmoji.org ; et des dessins maison (« maison:… »,
// src/images/maison/), au même style et sous la même licence.
export const ${table}: Readonly<Record<string, string>> = {
${dessins.join('\n')}
}
`)
}
console.log(`${codes.length} emojis écrits dans src/images/donnees/ (${Object.keys(STYLES).join(', ')})`)
