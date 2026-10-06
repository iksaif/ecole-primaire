// Traduction typée, pure (sans Vue) : lisible par node. `t('nav.accueil')`, `t('reglages.remise.fait', { n: 3 })`.
//  - la clé est un chemin du catalogue français (source) : une clé inconnue ne compile pas ;
//  - les paramètres `{nom}` du texte français sont exigés (et seulement eux) ; un pluriel demande `n` ;
//  - un texte à pluriel (`{ one, other }`) est choisi par `Intl.PluralRules` de la langue (breton : one/two/few/many/other).
// Recherche : catalogue de la langue → français → la clé elle-même (ne se produit pas si le compilateur est content).
// Les textes de CONTENU d'un exercice (énoncés, fiches) ont leur propre catalogue typé : voir catalogue.ts.
import type { Langue } from './registre.ts'
import { LANGUES, LANGUE_SOURCE } from './registre.ts'
import type { ArgsParams, CleListeDe, CleTexteDe, Chemins, FeuilleA, Pluriel, ValeurParam } from './types.ts'
import type fr from './fr/textes/index.ts'

/** Catalogue source (français) : donne les clés. */
export type CatalogueSource = typeof fr
/** Clés valides de `t` (« nav.accueil »). */
export type Cle = Chemins<CatalogueSource>
/** Clés dont la feuille est un texte (ou un pluriel), pas une liste. */
export type CleTexte = CleTexteDe<CatalogueSource>
/** Clés dont la feuille est une liste de textes. */
export type CleListe = CleListeDe<CatalogueSource>

const regles: Partial<Record<Langue, Intl.PluralRules>> = {}

/** La feuille d'un arbre de textes à un chemin « a.b.c » (undefined si elle n'y est pas). */
export function lireFeuille(arbre: unknown, cle: string): unknown {
  let v = arbre
  for (const k of cle.split('.')) v = (v as Record<string, unknown> | undefined)?.[k]
  return v
}

function feuille(l: Langue, cle: string): unknown {
  return lireFeuille(LANGUES[l].textes, cle)
}

export function interpoler(texte: string, params?: Record<string, unknown>): string {
  if (!params) return texte
  return texte.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m))
}

function choisirPluriel(v: Pluriel, n: number, l: Langue): string {
  const jeu = (regles[l] ??= new Intl.PluralRules(LANGUES[l].bcp47))
  return v[jeu.select(n)] ?? v.other
}

/** Le texte d'une feuille (texte ou pluriel) dans une langue, paramètres posés ; undefined si ce n'est pas un texte. */
export function texteDeFeuille(v: unknown, l: Langue, params?: Record<string, unknown>): string | undefined {
  if (v && typeof v === 'object' && !Array.isArray(v) && 'other' in v) v = choisirPluriel(v as Pluriel, Number(params?.n ?? 0), l)
  return typeof v === 'string' ? interpoler(v, params) : undefined
}

/** Traduit une clé dans une langue (fonction pure). */
export function traduire<C extends CleTexte>(l: Langue, cle: C, ...args: ArgsParams<FeuilleA<CatalogueSource, C>>): string {
  const params = args[0] as Record<string, ValeurParam> | undefined
  return texteDeFeuille(feuille(l, cle) ?? feuille(LANGUE_SOURCE, cle), l, params) ?? cle
}

/** Liste de textes (sans paramètres) dans une langue. */
export function traduireListe(l: Langue, cle: CleListe): readonly string[] {
  const v = feuille(l, cle) ?? feuille(LANGUE_SOURCE, cle)
  return Array.isArray(v) ? v : []
}

/** Un `t` lié à une langue : `contenu('fr').t('nav.accueil')`. Pour les textes de l'interface dans une autre langue que celle de l'écran ; le contenu d'un exercice : catalogue.ts. */
export function contenu(l: Langue) {
  return {
    langue: l,
    t: <C extends CleTexte>(cle: C, ...args: ArgsParams<FeuilleA<CatalogueSource, C>>): string => traduire(l, cle, ...args),
    liste: (cle: CleListe): readonly string[] => traduireListe(l, cle),
  }
}
