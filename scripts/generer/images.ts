// Importe les emojis OpenMoji (couleur) de src/images/tables.ts dans src/images/openmoji-donnees.ts : un dessin SVG par code, nettoyé
// (sans identifiants ni espaces inutiles). Les fichiers viennent de la version d'OpenMoji ci-dessous, téléchargés une fois dans un cache
// hors du dépôt ; le site, lui, ne fait aucune requête. Échoue si un code n'existe pas. À relancer quand on ajoute un emoji à tables.ts.
//   node scripts/generer/images.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { EMOJIS } from '../../src/images/tables.ts'

const VERSION = '15.1.0'
const SOURCE = `https://raw.githubusercontent.com/hfg-gmuend/openmoji/${VERSION}/color/svg`
const CACHE = join(import.meta.dirname, '../../node_modules/.cache/openmoji', VERSION)
const SORTIE = join(import.meta.dirname, '../../src/images/openmoji-donnees.ts')

/** Le fichier d'un code, téléchargé si le cache ne l'a pas encore (essai avec le sélecteur FE0F si le code seul n'existe pas). */
async function charger(code: string): Promise<string> {
  const fichier = join(CACHE, `${code}.svg`)
  if (existsSync(fichier)) return readFileSync(fichier, 'utf8')
  for (const nom of [code, `${code}-FE0F`]) {
    const reponse = await fetch(`${SOURCE}/${nom}.svg`)
    if (!reponse.ok) continue
    const svg = await reponse.text()
    writeFileSync(fichier, svg)
    return svg
  }
  throw new Error(`OpenMoji ${VERSION} n'a pas l'emoji ${code}`)
}

/** Le contenu du <svg> sans l'enveloppe : plus d'identifiants (copies multiples dans une page), pas d'espaces entre balises. */
function nettoyer(code: string, svg: string): string {
  if (svg.includes('url(#')) throw new Error(`${code} : renvoi à un identifiant (dégradé, masque) : à traiter avant de retirer les id`)
  const interieur = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  return interieur.replace(/\sid="[^"]*"/g, '').replace(/>\s+</g, '><').trim()
}

mkdirSync(CACHE, { recursive: true })
const codes = [...new Set(Object.values(EMOJIS))].sort()
const dessins: string[] = []
for (const code of codes) dessins.push(`  '${code}': '${nettoyer(code, await charger(code)).replace(/'/g, "\\'")}',`)
writeFileSync(SORTIE, `// GÉNÉRÉ par scripts/generer/images.ts d'après src/images/tables.ts : ne pas modifier à la main.
// Dessins SVG des emojis OpenMoji ${VERSION} (couleur), CC BY-SA 4.0 — https://openmoji.org
export const OPENMOJI: Readonly<Record<string, string>> = {
${dessins.join('\n')}
}
`)
console.log(`${codes.length} emojis écrits dans src/images/openmoji-donnees.ts`)
