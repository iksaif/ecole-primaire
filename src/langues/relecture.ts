// La relecture du breton : quels textes sont à faire relire (marqués « // br: à relire » dans le source) et leur français en face.
// Pur, sans fichier ni DOM : lu par `npm run i18n` (scripts/verifier/i18n/, qui lit les fichiers) et par la page /dev/relecture-breton
// (src/views/dev/, qui lit les modules et leur source brut avec Vite). Trois sortes de catalogues, trois façons de marquer :
//   section   src/langues/<langue>/textes/<section>.ts : le marqueur est sur la ligne de la clé ou sur la ligne d'avant, il vaut pour tout ce qu'elle contient ;
//   contenu   src/exercices/<id>/textes.ts (`catalogue(…)`) : le marqueur est sur la ligne d'une clé du bloc `br: { … }`, il vaut pour tout son sous-arbre ;
//   affiche   src/affiches/<id>/textes.ts (`TextesAffiche`) : un marqueur en fin de ligne vaut pour toutes les clés de la ligne.

/** Un catalogue de textes : des sous-arbres, et des feuilles (un texte, une liste de textes, un pluriel). */
export interface Arbre { [cle: string]: unknown }

const MARQUEUR = /br: à relire/

const estFeuille = (v: unknown): boolean =>
  typeof v === 'string' || Array.isArray(v) || (typeof v === 'object' && v !== null && 'other' in v)

/** Les feuilles d'un catalogue, clés pointées : `{ a: { b: 'x' } }` → `[['a.b', 'x']]`. */
export function feuilles(arbre: Arbre, prefixe = ''): [string, unknown][] {
  return Object.entries(arbre).flatMap(([k, v]): [string, unknown][] =>
    estFeuille(v) ? [[prefixe + k, v]] : feuilles(v as Arbre, `${prefixe}${k}.`))
}

/** Le texte d'une valeur de catalogue, tel qu'on l'affiche en relecture. */
export function texteBrut(v: unknown): string {
  if (typeof v === 'function') return `ƒ ${v.toString().replace(/\s+/g, ' ')}`
  if (Array.isArray(v)) return v.join(' · ')
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

/** Les chemins de clés marqués « à relire » dans le source d'une section de textes ; l'indentation (2 espaces) donne le chemin. */
export function marquesSection(source: string): Set<string> {
  const res = new Set<string>(), pile: string[] = []
  let precedenteMarquee = false
  for (const l of source.split('\n')) {
    const m = l.match(/^(\s*)(['"]?)([\w'-]+)\2:\s*(.*)$/)
    const marquee = MARQUEUR.test(l)
    if (!m) { precedenteMarquee = marquee && /^\s*\/\//.test(l); continue }
    const niveau = m[1].length / 2 - 1
    pile.length = Math.max(niveau, 0); pile[pile.length] = m[3]
    if (marquee || precedenteMarquee || pile.slice(0, -1).some(c => res.has(c))) res.add(pile.join('.'))
    precedenteMarquee = false
  }
  return res
}

/** Une clé est à relire si elle est marquée, ou si l'un de ses parents l'est. */
const estMarquee = (cle: string, marquees: ReadonlySet<string>): boolean => [...marquees].some(c => cle === c || cle.startsWith(`${c}.`))

/** Les clés de premier niveau marquées « à relire » dans le bloc `br: { … }` d'un catalogue de contenu (tout leur sous-arbre est à relire). */
export function marquesContenu(source: string): Set<string> {
  const debut = source.search(/\bbr:\s*\{/)
  const bloc = source.slice(Math.max(0, debut))
  return new Set([...bloc.matchAll(/^\s*(['"]?)([\w'-]+)\1:.*br: à relire/gm)].map(m => m[2]))
}

/** Les clés (pointées, entre apostrophes) marquées « à relire » dans le bloc `br: { … }` des textes d'une affiche : le marqueur vaut pour sa ligne entière. */
export function marquesAffiche(source: string): Set<string> {
  const debut = source.search(/\bbr:\s*\{/)
  const res = new Set<string>()
  let precedenteMarquee = false
  for (const l of source.slice(Math.max(0, debut)).split('\n')) {
    const marquee = MARQUEUR.test(l)
    const cles = [...l.matchAll(/(?:^\s*|,\s*)(['"]?)([\w.'-]+?)\1\s*:\s*['"`]/g)].map(m => m[2])
    if (marquee || precedenteMarquee) for (const c of cles) res.add(c)
    precedenteMarquee = marquee && cles.length === 0 && /^\s*\/\//.test(l)
  }
  return res
}

/** D'où vient un texte : l'interface (sections), le contenu d'un exercice, ou une affiche. */
export type OrigineRelecture = 'interface' | 'exercice' | 'affiche'

/** Un texte breton à relire (ou simplement à lire) : sa clé, le français et la traduction actuelle. */
export interface LigneRelecture {
  origine: OrigineRelecture
  /** section de textes, exercice ou affiche : le regroupement de la relecture */
  section: string
  /** clé pointée dans la section */
  cle: string
  francais: string
  /** la traduction actuelle ; `null` quand il n'y en a pas (« français seulement », clé manquante) */
  breton: string | null
  aRelire: boolean
}

/** Les lignes d'une section de textes de l'interface. `sourceBr` : le source de `br/textes/<section>.ts`, qui porte les marqueurs. */
export function lignesSection(section: string, fr: Arbre, br: Arbre, sourceBr: string): LigneRelecture[] {
  const traductions = new Map(feuilles(br)), marquees = marquesSection(sourceBr)
  return feuilles(fr).map(([cle, v]) => ({
    origine: 'interface', section, cle, francais: texteBrut(v),
    breton: traductions.has(cle) ? texteBrut(traductions.get(cle)) : null, aRelire: estMarquee(cle, marquees),
  }))
}

/** Les lignes du catalogue de contenu d'un exercice. `traduction` : le bloc `br` (absent : « français seulement »). */
export function lignesContenu(id: string, source: Arbre, traduction: Arbre | undefined, sourceTs: string): LigneRelecture[] {
  const traductions = new Map(feuilles(traduction ?? {})), marquees = traduction ? marquesContenu(sourceTs) : new Set<string>()
  return feuilles(source).map(([cle, v]) => ({
    origine: 'exercice', section: id, cle, francais: texteBrut(v),
    breton: traductions.has(cle) ? texteBrut(traductions.get(cle)) : null, aRelire: marquees.has(cle.split('.')[0]),
  }))
}

/** Les lignes des textes d'une affiche (clés à plat : `titre`, `variante.<id>.court`…). */
export function lignesAffiche(id: string, fr: Readonly<Record<string, string>>, br: Readonly<Record<string, string>> | undefined, sourceTs: string): LigneRelecture[] {
  const marquees = br ? marquesAffiche(sourceTs) : new Set<string>()
  return Object.entries(fr).map(([cle, v]) => ({
    origine: 'affiche', section: id, cle, francais: v, breton: br?.[cle] ?? null, aRelire: marquees.has(cle),
  }))
}
