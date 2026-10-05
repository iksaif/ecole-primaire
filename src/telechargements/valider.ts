// Vérifie la forme des JSON des fiches. Deux usages : le build refuse d'écrire des données incohérentes (ecrire.ts), et la
// page refuse de lire un index d'une autre version ou abîmé (useFiches) au lieu d'afficher n'importe quoi.
// Les types disent la forme ; ici on contrôle ce que les types ne savent pas (version, unicité, références, classes).
import { NIVEAUX } from '../data/classes.ts'
import { GENRES, USAGES, VERSION_SCHEMA, usageDe } from './types.ts'
import type { Entree, EntreeIndex, Image, IndexFiches, Variante } from './types.ts'

/** Données illisibles ou d'une autre version. */
export class ErreurSchema extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ErreurSchema'
  }
}

const estObjet = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function texteValide(t: unknown, ou: string, p: string[]): void {
  if (!estObjet(t) || typeof t.fr !== 'string') return void p.push(`${ou} : texte sans français`)
  for (const [l, v] of Object.entries(t)) if (typeof v !== 'string') p.push(`${ou}.${l} : pas du texte`)
}

function imageValide(i: Image, ou: string, p: string[]): void {
  if (!estObjet(i) || typeof i.chemin !== 'string' || !i.chemin || i.chemin.startsWith('/') || i.chemin.includes('..')) p.push(`${ou} : chemin absent ou non relatif`)
  else if (!(i.largeur > 0) || !(i.hauteur > 0)) p.push(`${ou} : dimensions`)
}

/** Problèmes d'une entrée d'index (liste vide : tout va bien). */
export function problemesEntreeIndex(e: EntreeIndex): string[] {
  const p: string[] = []
  const ou = `entrée « ${e?.slug} »`
  if (!estObjet(e) || typeof e.slug !== 'string' || !SLUG.test(e.slug)) return [`${ou} : slug invalide`]
  for (const cle of ['titre', 'titreCourt', 'description'] as const) texteValide(e[cle], `${ou}.${cle}`, p)
  if (!Array.isArray(e.niveaux) || !e.niveaux.length || e.niveaux.some(n => !(NIVEAUX as readonly string[]).includes(n))) p.push(`${ou} : niveaux = classes valides, au moins une (${JSON.stringify(e.niveaux)})`)
  if (!GENRES.includes(e.genre)) p.push(`${ou} : genre « ${e.genre} » inconnu`)
  else if (e.usage !== usageDe(e.genre)) p.push(`${ou} : usage « ${e.usage} » ne correspond pas au genre « ${e.genre} »`)
  if (!Array.isArray(e.langues) || !e.langues.length) p.push(`${ou} : aucune langue`)
  if (!(e.nbPages >= 1) || !(e.nbVariantes >= 1)) p.push(`${ou} : nbPages et nbVariantes >= 1`)
  if (!(e.taillePdf > 0)) p.push(`${ou} : taillePdf`)
  imageValide(e.miniature, `${ou}.miniature`, p)
  if (typeof e.recherche !== 'string') p.push(`${ou} : recherche`)
  return p
}

/** Problèmes d'un index : version, entrées, slugs uniques, parents existants, filtres cohérents avec les entrées. */
export function problemesIndex(index: IndexFiches): string[] {
  if (!estObjet(index)) return ['index : pas un objet']
  if (index.version !== VERSION_SCHEMA) return [`index : version ${index.version}, ${VERSION_SCHEMA} attendue`]
  const p: string[] = []
  if (typeof index.site !== 'string' || !index.site) p.push('index : site absent')
  if (Number.isNaN(Date.parse(index.genereLe))) p.push('index : genereLe n\'est pas une date ISO')
  if (!Array.isArray(index.entrees)) return [...p, 'index : entrees absentes']
  const slugs = new Set<string>()
  for (const e of index.entrees) {
    p.push(...problemesEntreeIndex(e))
    if (slugs.has(e.slug)) p.push(`slug « ${e.slug} » en double`)
    slugs.add(e.slug)
  }
  for (const e of index.entrees) if (e.parent !== null && !slugs.has(e.parent)) p.push(`entrée « ${e.slug} » : parent « ${e.parent} » absent`)
  const domaines = new Set(index.filtres?.domaines?.map(d => d.id))
  for (const e of index.entrees) if (!domaines.has(e.domaine)) p.push(`entrée « ${e.slug} » : domaine « ${e.domaine} » absent des filtres`)
  const classes = new Set(index.filtres?.classes)
  for (const e of index.entrees) for (const n of e.niveaux ?? []) if (!classes.has(n)) p.push(`entrée « ${e.slug} » : classe « ${n} » absente des filtres`)
  for (const u of index.filtres?.usages ?? []) if (!USAGES.includes(u)) p.push(`filtres : usage « ${u} » inconnu`)
  return p
}

function problemesVariante(v: Variante, ou: string, p: string[]): void {
  if (!v.id) p.push(`${ou} : id absent`)
  if (v.titre) texteValide(v.titre, `${ou}.titre`, p)
  if (!Array.isArray(v.pdfs) || !v.pdfs.length) p.push(`${ou} : aucun PDF`)
  else for (const f of v.pdfs) if (!f.chemin?.endsWith('.pdf') || !(f.taille > 0) || !(f.nbPages >= 1)) p.push(`${ou} : PDF ${f.chemin} invalide`)
  if (!Array.isArray(v.pages) || !v.pages.length) p.push(`${ou} : aucun aperçu`)
  else v.pages.forEach((i, k) => imageValide(i, `${ou}.pages[${k}]`, p))
}

/** Problèmes d'une entrée complète. `slugsConnus` : si fourni, les voisines doivent y être. */
export function problemesEntree(e: Entree, slugsConnus?: ReadonlySet<string>): string[] {
  const p = problemesEntreeIndex(e)
  const ou = `entrée « ${e?.slug} »`
  if (p.length && !e?.slug) return p
  texteValide(e.descriptionLongue, `${ou}.descriptionLongue`, p)
  if (!Array.isArray(e.variantes) || !e.variantes.length) p.push(`${ou} : aucune variante`)
  else {
    if (e.variantes.length !== e.nbVariantes) p.push(`${ou} : nbVariantes ${e.nbVariantes} pour ${e.variantes.length} variantes`)
    const ids = new Set(e.variantes.map(v => v.id))
    if (ids.size !== e.variantes.length) p.push(`${ou} : variantes en double`)
    e.variantes.forEach((v, k) => problemesVariante(v, `${ou}.variantes[${k}]`, p))
  }
  if (!Array.isArray(e.competences)) p.push(`${ou} : competences absentes`)
  if (!estObjet(e.reglages)) p.push(`${ou} : reglages absents`)
  if (slugsConnus) for (const s of e.voisines ?? []) if (!slugsConnus.has(s)) p.push(`${ou} : voisine « ${s} » inconnue`)
  return p
}

/** Lit un JSON d'index (côté page) : rend l'index ou lève ErreurSchema avec ce qui ne va pas. */
export function lireIndex(donnees: unknown): IndexFiches {
  const index = donnees as IndexFiches
  const p = problemesIndex(index)
  if (p.length) throw new ErreurSchema(p.slice(0, 5).join(' ; '))
  return index
}

/** Lit un JSON d'entrée (côté page). */
export function lireEntree(donnees: unknown): Entree {
  const entree = donnees as Entree
  const p = problemesEntree(entree)
  if (p.length) throw new ErreurSchema(p.slice(0, 5).join(' ; '))
  return entree
}

