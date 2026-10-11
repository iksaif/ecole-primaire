// Les fichiers OpenMoji des générateurs d'images (images.ts : les contenus ; icones.ts : l'interface) : téléchargés une fois dans un
// cache hors du dépôt (node_modules/.cache/openmoji/<version>/color), puis nettoyés pour être intégrés au code. Le site, lui, ne fait
// aucune requête.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const VERSION_OPENMOJI = '15.1.0'
const CACHE = join(import.meta.dirname, '../../node_modules/.cache/openmoji', VERSION_OPENMOJI, 'color')

/** Le fichier OpenMoji d'un code, téléchargé si le cache ne l'a pas encore (essai avec le sélecteur FE0F si le code seul n'existe pas). */
export async function chargerOpenMoji(code: string): Promise<string> {
  mkdirSync(CACHE, { recursive: true })
  const fichier = join(CACHE, `${code}.svg`)
  if (existsSync(fichier)) return readFileSync(fichier, 'utf8')
  for (const nom of [code, `${code}-FE0F`]) {
    const reponse = await fetch(`https://raw.githubusercontent.com/hfg-gmuend/openmoji/${VERSION_OPENMOJI}/color/svg/${nom}.svg`)
    if (!reponse.ok) continue
    const svg = await reponse.text()
    writeFileSync(fichier, svg)
    return svg
  }
  throw new Error(`OpenMoji ${VERSION_OPENMOJI} n'a pas l'emoji ${code}`)
}

/** Le contenu du <svg> sans l'enveloppe : plus d'identifiants (copies multiples dans une page), pas d'espaces entre balises. */
export function nettoyer(code: string, svg: string): string {
  if (svg.includes('url(#')) throw new Error(`${code} : renvoi à un identifiant (dégradé, masque) : à traiter avant de retirer les id`)
  const interieur = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  return interieur.replace(/\sid="[^"]*"/g, '').replace(/>\s+</g, '><').trim()
}

/** Une ligne d'une table générée : `  'CODE': '<dessin>',`. */
export const ligneDessin = (code: string, dessin: string): string => `  '${code}': '${dessin.replace(/'/g, "\\'")}',`
