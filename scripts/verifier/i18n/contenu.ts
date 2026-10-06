// Les catalogues de contenu des exercices : src/exercices/<id>/textes.ts (`catalogue(…)` de src/langues/catalogue.ts).
// Le compilateur vérifie déjà les clés du breton contre le français ; ici on compte les passages « à relire » (clé marquée sur
// sa ligne, dans le bloc `br: { … }`) et on ajoute les textes au tableau de relecture. Sans bloc `br`, rien à relire.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chemin } from '../../lib/racine.ts'
import { feuilles } from './arbre.ts'
import type { Arbre, Bilan } from './arbre.ts'
import { AUTRE } from './ancien.ts'
import { ligneSection, ligneTexte } from './relecture.ts'

/** Ce que la relecture lit d'un `catalogue(…)` : le texte source et les traductions par langue. */
interface Catalogue { sorte: 'catalogue', source: Arbre, traductions: Record<string, Arbre | undefined> }
const estCatalogue = (v: unknown): v is Catalogue => (v as { sorte?: unknown } | null)?.sorte === 'catalogue'

export async function verifierContenu(relecture: boolean): Promise<Bilan & { catalogues: number }> {
  const dossier = chemin('src/exercices')
  const bilan = { textes: 0, aRelire: 0, problemes: 0, lignes: [] as string[], catalogues: 0 }
  for (const id of readdirSync(dossier).sort()) {
    const f = join(dossier, id, 'textes.ts')
    let source: string
    try { source = readFileSync(f, 'utf8') } catch { continue }
    if (!/catalogue\(/.test(source)) continue
    const cat = Object.values(await import(pathToFileURL(f).href) as Record<string, unknown>).find(estCatalogue)
    if (!cat) continue
    bilan.catalogues++
    const traduction = cat.traductions[AUTRE]
    const fr = new Map(feuilles(cat.source)), br = new Map(feuilles(traduction ?? {}))
    const bloc = source.slice(Math.max(0, source.search(/\bbr:\s*\{/)))
    const marquees = new Set(traduction ? [...bloc.matchAll(/^\s*(['"]?)([\w'-]+)\1:.*br: à relire/gm)].map(m => m[2]) : [])
    const racineDe = (k: string): string => k.split('.')[0]
    if (br.size && ([...fr.keys()].some(k => !br.has(k)) || [...br.keys()].some(k => !fr.has(k)))) {
      bilan.problemes++
      console.log(`✗ exercices/${id}/textes.ts : clés du breton différentes du français`)
    }
    bilan.textes += fr.size
    for (const k of br.keys()) if (marquees.has(racineDe(k))) bilan.aRelire++
    if (!relecture) continue
    bilan.lignes.push(ligneSection(`contenu : ${id}`))
    for (const [k, v] of fr) bilan.lignes.push(ligneTexte(`${id}.${k}`, v, br.get(k), marquees.has(racineDe(k)), '— français seulement —'))
  }
  return bilan
}
