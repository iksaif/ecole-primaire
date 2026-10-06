// Les catalogues typés : src/langues/<langue>/textes/<section>.ts. Le compilateur (npm run types) refuse déjà une clé manquante
// ou en trop ; ici on compte les passages « à relire » et on ajoute les textes au tableau de relecture.
// Une clé est marquée par « // br: à relire » sur sa ligne ou la ligne précédente ; une clé marquée marque tout son contenu.
// L'indentation (2 espaces) donne le chemin de la clé.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { LANGUE_SOURCE } from '../../../src/langues/registre.ts'
import { chemin } from '../../lib/racine.ts'
import { feuilles } from './arbre.ts'
import type { Arbre, Bilan } from './arbre.ts'
import { AUTRE } from './ancien.ts'
import { ligneSection, ligneTexte } from './relecture.ts'

const dossierTextes = (l: string): string => chemin('src/langues', l, 'textes')

/** Les chemins de clés marqués « à relire » dans le source d'une section. */
function marques(source: string): Set<string> {
  const res = new Set<string>(), pile: string[] = []
  let precedenteMarquee = false
  for (const l of source.split('\n')) {
    const m = l.match(/^(\s*)(['"]?)([\w'-]+)\2:\s*(.*)$/)
    const marquee = /br: à relire/.test(l)
    if (!m) { precedenteMarquee = marquee && /^\s*\/\//.test(l); continue }
    const niveau = m[1].length / 2 - 1
    pile.length = Math.max(niveau, 0); pile[pile.length] = m[3]
    if (marquee || precedenteMarquee || pile.slice(0, -1).some(c => res.has(c))) res.add(pile.join('.'))
    precedenteMarquee = false
  }
  return res
}

const charger = async (l: string, fichier: string): Promise<Arbre> =>
  (await import(pathToFileURL(join(dossierTextes(l), fichier)).href)).default as Arbre

export async function verifierTypees(relecture: boolean): Promise<Bilan & { sections: number }> {
  const sections = readdirSync(dossierTextes(LANGUE_SOURCE)).filter(f => f.endsWith('.ts') && f !== 'index.ts').sort()
  const bilan = { textes: 0, aRelire: 0, problemes: 0, lignes: [] as string[], sections: sections.length }
  for (const f of sections) {
    const section = f.replace(/\.ts$/, '')
    const fr = new Map(feuilles(await charger(LANGUE_SOURCE, f)))
    const br = new Map(feuilles(await charger(AUTRE, f)))
    const marquees = marques(readFileSync(join(dossierTextes(AUTRE), f), 'utf8'))
    const estMarquee = (k: string): boolean => [...marquees].some(c => k === c || k.startsWith(`${c}.`))
    bilan.textes += fr.size
    for (const k of fr.keys()) if (estMarquee(k)) bilan.aRelire++
    if ([...fr.keys()].some(k => !br.has(k)) || [...br.keys()].some(k => !fr.has(k))) {
      bilan.problemes++
      console.log(`✗ langues/${AUTRE}/textes/${f} : clés différentes du français`)
    }
    if (!relecture) continue
    bilan.lignes.push(ligneSection(section))
    for (const [k, v] of fr) bilan.lignes.push(ligneTexte(`${section}.${k}`, v, br.get(k), estMarquee(k), '— manquant —'))
  }
  return bilan
}
