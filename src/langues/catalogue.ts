// Catalogues de CONTENU : les textes qu'un exercice écrit sur ses fiches et dans ses énoncés (consignes, titres, corrigés).
// À ne pas mélanger aux textes de l'INTERFACE (boutons, réglages : sections de src/langues/<langue>/textes/, lues par `t`).
//
//   // src/exercices/<id>/textes.ts
//   export const CONTENU = catalogue({ titre: 'Les synonymes', consigneFiche: 'Coche le bon mot.' })                // français seulement
//   export const CONTENU = catalogue({ titre: 'Suites' }, { br: { titre: 'Heuliadoù' } })                            // fr + br
//
// Le français est la source (`as const` implicite). Une autre langue, quand elle est donnée, doit avoir EXACTEMENT les mêmes
// clés, des textes pour des textes, des pluriels pour des pluriels (`Traductions`) : une clé manquante ou en trop ne compile
// pas. Sans traduction, le catalogue reste français seulement : c'est le cas d'un exercice de français (contenu toujours en
// français) ; une langue absente retombe sur le français. Pur (sans Vue) : lisible par node.
import type { Langue } from './registre.ts'
import { LANGUES, LANGUE_SOURCE, estLangue } from './registre.ts'
import type { ArgsParams, CleListeDe, CleTexteDe, Feuille, FeuilleA, Traductions, ValeurParam } from './types.ts'
import { lireFeuille, texteDeFeuille } from './traduire.ts'

/** Un arbre de textes : des sections imbriquées dont les feuilles sont des textes, des listes ou des pluriels. */
export interface Arbre { readonly [cle: string]: Feuille | Arbre }

/** Les langues autres que la langue source : celles qu'un catalogue peut traduire. */
export type LangueTraduite = Exclude<Langue, typeof LANGUE_SOURCE>

/** Ce que les consommateurs (build des fiches, tests) lisent d'un catalogue, sans connaître ses clés. */
export interface CatalogueContenu {
  readonly sorte: 'catalogue'
  readonly source: Arbre
  readonly traductions: Readonly<Partial<Record<LangueTraduite, Arbre>>>
}

/** Catalogue de contenu dont S est le français : la source des clés. */
export interface Catalogue<S extends Arbre = Arbre> extends CatalogueContenu {
  readonly source: S
}

/** Crée un catalogue de contenu : le français, puis (facultatif) les traductions, vérifiées contre le français. */
export function catalogue<const S extends Arbre>(
  source: S,
  traductions: { readonly [L in LangueTraduite]?: NoInfer<Traductions<S>> } = {},
): Catalogue<S> {
  return { sorte: 'catalogue', source, traductions: traductions as Readonly<Partial<Record<LangueTraduite, Arbre>>> }
}

export const estCatalogue = (v: unknown): v is CatalogueContenu => typeof v === 'object' && v !== null && (v as { sorte?: unknown }).sorte === 'catalogue'

/** Langues qui ont une version de ce catalogue, la source comprise. */
export const languesDe = (cat: CatalogueContenu): Langue[] => [LANGUE_SOURCE, ...(Object.keys(cat.traductions) as LangueTraduite[])]

/** T(cle, params) : le texte de l'exercice, que reçoivent le générateur et la fiche (type `Traducteur` du noyau). */
export type TraducteurContenu = (cle: string, params?: Record<string, unknown>) => string

// Les mots communs des fiches (« corrige », « prenom », « date »…) viennent de la section `communs` de l'interface.
function chercher(cat: CatalogueContenu, l: Langue, cle: string): unknown {
  return lireFeuille(cat.traductions[l as LangueTraduite], cle) ?? lireFeuille(cat.source, cle)
    ?? lireFeuille(LANGUES[l].textes, `communs.${cle}`) ?? lireFeuille(LANGUES[LANGUE_SOURCE].textes, `communs.${cle}`)
}

/**
 * Le T d'un catalogue dans une langue. `langue` : un code, ou une fonction relue à chaque appel (une vue passe
 * `() => langueContenu.value`, pour que le texte suive la langue). Rend la clé elle-même si le texte n'existe pas
 * (`texteMulti` du build s'en sert pour savoir qu'une clé facultative est absente).
 */
export function traducteur(cat: CatalogueContenu, langue: string | (() => string)): TraducteurContenu {
  return (cle, params) => {
    const code = typeof langue === 'function' ? langue() : langue
    const l = estLangue(code) ? code : LANGUE_SOURCE
    return texteDeFeuille(chercher(cat, l, cle), l, params) ?? cle
  }
}

/** Comme `traducteur`, avec en plus des clés typées d'après le français du catalogue : `contenuDe(CONTENU, 'br').t('titre')`. */
export function contenuDe<S extends Arbre>(cat: Catalogue<S>, langue: string | (() => string)) {
  const T = traducteur(cat, langue)
  return {
    T,
    t: <C extends CleTexteDe<S>>(cle: C, ...args: ArgsParams<FeuilleA<S, C>>): string => T(cle, args[0] as Record<string, ValeurParam> | undefined),
    liste: (cle: CleListeDe<S>): readonly string[] => {
      const code = typeof langue === 'function' ? langue() : langue
      const l = estLangue(code) ? code : LANGUE_SOURCE
      const v = lireFeuille(cat.traductions[l as LangueTraduite], cle) ?? lireFeuille(cat.source, cle)
      return Array.isArray(v) ? v : []
    },
  }
}
