// Le catalogue des affiches toutes prêtes, dérivé des définitions : une entrée par variante et par langue. Données pures,
// sérialisables (aucune fonction) : le build en écrit l'index et un fichier JSON par entrée (plan 11), et l'app les lit.
import { contenu } from '../i18n/index.js'
import type { Classe, CompetenceId, DomaineId, Reglages } from '../noyau/types.ts'
import { cleVariante } from './textes.ts'
import type { DefinitionAffiche, ModuleAffiche } from './types.ts'

/** Une affiche toute prête du catalogue. */
export interface EntreeAffiche {
  slug: string
  /** nom court (carte), titre et description de la page de téléchargement, dans la langue de l'affiche */
  court: string
  titre: string
  description: string
  /** classes de la variante */
  niveaux: readonly Classe[]
  domaine: DomaineId
  genre: 'affiche'
  competences: readonly CompetenceId[]
  /** langue de l'affiche : l'entrée n'est proposée que sur les sites qui la publient */
  langues: readonly string[]
  /** réglages qui produisent l'affiche : genererAffiche(module(config.affiche), config) */
  config: { affiche: string, variante: string, langue: string }
  /** lien « Personnaliser » : le formulaire ouvert sur cette affiche, cette variante et cette langue */
  lien: string
}

/**
 * Slug publié : celui de la variante s'il existe (affiche reportée : ses liens ne changent pas), sinon
 * `affiche-<id>-<variante>` ; une langue autre que le français ajoute `-<langue>`.
 */
export const slugDe = (d: DefinitionAffiche, variante: string, langue: string): string =>
  `${d.variantes[variante].slug ?? `affiche-${d.id}-${variante}`}${langue === 'fr' ? '' : `-${langue}`}`

/** Lien « Personnaliser » : la page de réglage ouverte sur cette affiche, cette variante et cette langue. */
export const lienDe = (d: DefinitionAffiche, variante: string, langue: string): string =>
  `${d.route}?affiche=${d.id}&variante=${variante}${langue === 'fr' ? '' : `&langue=${langue}`}`

/** Les entrées de catalogue d'une affiche : une par variante et par langue. */
export function entreesDe<R extends Reglages>({ definition, textes }: ModuleAffiche<R>): EntreeAffiche[] {
  const d = definition as DefinitionAffiche
  return Object.entries(d.variantes).flatMap(([id, v]) => d.langues.map(langue => {
    const T = contenu(textes, langue).t
    return {
      slug: slugDe(d, id, langue),
      court: T(cleVariante(id, 'court')), titre: T(cleVariante(id, 'titre')), description: T(cleVariante(id, 'description')),
      niveaux: v.niveaux, domaine: d.domaine, genre: d.genre, competences: v.competences, langues: [langue],
      config: { affiche: d.id, variante: id, langue }, lien: lienDe(d, id, langue),
    }
  }))
}

/** Le catalogue d'une liste d'affiches, filtré sur les langues du site. */
export const catalogueDe = (modules: readonly ModuleAffiche<never>[], langues: readonly string[]): EntreeAffiche[] =>
  modules.flatMap(m => entreesDe(m as ModuleAffiche)).filter(e => e.langues.some(l => langues.includes(l)))
