// Types du contexte de navigation (plan 13) : ce que l'utilisateur a choisi pour qu'on lui montre les bonnes ressources.
// Module pur (aucune dépendance à Vue) : partagé par l'analyse des adresses, le catalogue de ressources, les pages et la
// recherche. Le contexte vient de l'adresse d'abord, puis du réglage mémorisé, puis des défauts du site.
import type { Classe } from '../data/classes.ts'
import type { Langue } from '../langues/registre.ts'

/** Mode de langue : français seul, français + langue régionale (école bilingue), langue régionale seule (immersion). */
export const MODES = ['fr', 'bilingue', 'regionale'] as const
export type Mode = (typeof MODES)[number]

/** Profil de l'utilisateur : ne change que la disposition (nombre de classes, entrées de barre, accueil), jamais le contenu. */
export const PROFILS = ['enfant', 'parent', 'enseignant'] as const
export type Profil = (typeof PROFILS)[number]

/** Présentation d'une liste de ressources : cartes ou liste compacte. */
export const VUES = ['cartes', 'liste'] as const
export type Vue = (typeof VUES)[number]

export interface Contexte {
  /** classes choisies (une seule pour un parent ou un enfant, plusieurs pour un enseignant) ; jamais vide */
  readonly classes: readonly Classe[]
  readonly mode: Mode
  /** langue régionale active (selon le mode et le site), sinon `null` */
  readonly regionale: Langue | null
  readonly profil: Profil
  readonly vue: Vue
  /** références officielles (BO, page du PDF) affichées dans le tableau du programme */
  readonly refs: boolean
}
