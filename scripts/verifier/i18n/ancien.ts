// L'ancien format : src/i18n/<langue>/**/*.js, un fichier par composant ou module, `export default { … }`.
// Le français fait foi : une clé qui manque à l'autre langue est un problème (le français s'afficherait), une clé en trop un avertissement.
// « À relire » : commentaire `br: à relire` sur la ligne de la clé, ou sur la ligne précédente ; sans clé à côté, tout le fichier.
import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { CODES, LANGUE_SOURCE } from '../../../src/langues/registre.ts'
import { listerFichiers } from '../../lib/fichiers.ts'
import { chemin } from '../../lib/racine.ts'
import type { Arbre, Bilan } from './arbre.ts'
import { ligneSection, ligneTexte } from './relecture.ts'

const DOSSIER = 'src/i18n'
/** La langue à relire : la première qui n'est pas la source. */
export const AUTRE = CODES.find(c => c !== LANGUE_SOURCE) ?? LANGUE_SOURCE

function aRelire(source: string): { marquees: Set<string>, fichierEntier: boolean } {
  const marquees = new Set<string>()
  // on ne regarde que le corps du catalogue (pas l'en-tête du fichier)
  const lignes = source.slice(source.indexOf('export default')).split('\n')
  const cleDe = (l?: string): string | undefined => l?.match(/^\s*['"]?([\w-]+)['"]?\s*:/)?.[1]
  let fichierEntier = false
  lignes.forEach((l, i) => {
    if (!/br: à relire/.test(l)) return
    const cle = cleDe(l) ?? cleDe(lignes[i + 1])
    if (cle) marquees.add(cle); else fichierEntier = true
  })
  return { marquees, fichierEntier }
}

export async function verifierAncien(relecture: boolean): Promise<Bilan & { catalogues: number }> {
  const dossierDe = (l: string): string => chemin(DOSSIER, l)
  const modules = [...new Set(CODES.flatMap(l => listerFichiers(`${DOSSIER}/${l}`, ['js', 'ts']).map(f => relative(dossierDe(l), chemin(f)))))].sort()
  const bilan = { textes: 0, aRelire: 0, problemes: 0, lignes: [] as string[], catalogues: modules.length }
  for (const m of modules) {
    const cat: Record<string, Arbre> = {}, source: Record<string, string> = {}
    for (const l of [LANGUE_SOURCE, AUTRE]) {
      const f = join(dossierDe(l), m)
      try {
        cat[l] = (await import(pathToFileURL(f).href)).default as Arbre
        source[l] = readFileSync(f, 'utf8')
      } catch (e) {
        const erreur = e as { code?: string, message: string }
        console.log(`✗ ${l}/${m} : ${erreur.code === 'ERR_MODULE_NOT_FOUND' ? 'fichier absent' : erreur.message}`)
        bilan.problemes++
      }
    }
    const fr = cat[LANGUE_SOURCE], br = cat[AUTRE]
    if (!fr || !br) continue
    const manquantes = Object.keys(fr).filter(k => !(k in br))
    const enTrop = Object.keys(br).filter(k => !(k in fr))
    if (manquantes.length) { bilan.problemes++; console.log(`✗ ${AUTRE}/${m} : clés manquantes (le français s'affiche) : ${manquantes.join(', ')}`) }
    if (enTrop.length) console.log(`⚠ ${AUTRE}/${m} : clés en trop : ${enTrop.join(', ')}`)
    const { marquees, fichierEntier } = aRelire(source[AUTRE])
    bilan.textes += Object.keys(fr).length
    bilan.aRelire += fichierEntier ? Object.keys(br).length : marquees.size
    if (!relecture) continue
    bilan.lignes.push(ligneSection(m.replace(/\.(js|ts)$/, '')))
    for (const k of Object.keys(fr)) {
      bilan.lignes.push(ligneTexte(k, fr[k], k in br ? br[k] : undefined, fichierEntier || marquees.has(k), '— manquant —'))
    }
  }
  return bilan
}
