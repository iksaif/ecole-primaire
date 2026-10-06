// État de la page « Programme » dans l'adresse : matière, domaine, présentation. Les classes et les références officielles sont
// du contexte (src/contexte/) ; ici ne vivent que les paramètres propres à la page (`matiere`, `domaine`, `affichage`).
// L'adresse est la source de vérité : une adresse ouverte à froid reconstruit la même vue. Pur (lisible par node).
//   lire(ecrire(état)) = état ; une valeur invalide est ignorée, jamais d'exception.
// Pourquoi `affichage` et pas `vue` : `vue` (cartes | liste) est un paramètre de contexte partagé par toutes les listes du site,
// que les changements de contexte réécrivent ; « tableau » n'en est pas une valeur.
import type { Classe } from '../data/classes.ts'
import type { DomaineId, Matiere } from '../data/programme.ts'
import { domainesDe } from '../ressources/filtres.ts'
import type { QueryBrute } from '../contexte/url.ts'

/** Les matières du programme que la page propose (la langue régionale n'a pas de domaine au référentiel). */
export const MATIERES_PROGRAMME = ['maths', 'francais', 'monde'] as const satisfies readonly Matiere[]
export type MatiereProgramme = (typeof MATIERES_PROGRAMME)[number]

export const AFFICHAGES = ['tableau', 'liste'] as const
export type Affichage = (typeof AFFICHAGES)[number]

/** Les paramètres d'adresse propres à la page (le reste de l'adresse est du contexte ou d'une autre page). */
export const PARAMS_DE_LA_PAGE: readonly string[] = ['matiere', 'domaine', 'affichage']

export interface EtatProgramme {
  readonly matiere: MatiereProgramme
  /** domaine affiché : toujours un domaine de la matière aux cycles des classes choisies (`null` si la matière n'en a aucun) */
  readonly domaine: DomaineId | null
  /** `null` : non précisé (liste) */
  readonly affichage: Affichage | null
}

const premiere = (v: QueryBrute[string]): string | undefined => {
  const x = Array.isArray(v) ? v[0] : v
  return typeof x === 'string' ? x : undefined
}

/** Les domaines proposés pour une matière et des classes : ceux du programme aux cycles de ces classes. */
export function domainesProposes(matiere: MatiereProgramme, classes: readonly Classe[]): readonly string[] {
  return domainesDe(matiere, classes).map(d => d.id)
}

/** L'état d'une adresse ; un domaine hors de la matière ou des cycles des classes est remplacé par le premier. */
export function lireEtatProgramme(query: QueryBrute, classes: readonly Classe[]): EtatProgramme {
  const matiere = MATIERES_PROGRAMME.find(m => m === premiere(query.matiere)) ?? 'maths'
  const proposes = domainesProposes(matiere, classes)
  const demande = premiere(query.domaine)
  const domaine = (proposes.find(d => d === demande) ?? proposes[0] ?? null) as DomaineId | null
  return { matiere, domaine, affichage: AFFICHAGES.find(a => a === premiere(query.affichage)) ?? null }
}

/** Les paramètres d'adresse de l'état (toujours explicites : une adresse partagée ne dépend pas des défauts de l'autre). */
export function ecrireEtatProgramme(etat: EtatProgramme): Record<string, string> {
  const q: Record<string, string> = { matiere: etat.matiere }
  if (etat.domaine) q.domaine = etat.domaine
  if (etat.affichage) q.affichage = etat.affichage
  return q
}

/** La présentation affichée : celle de l'adresse, sinon la liste (la maquette ouvre la liste pour tous les profils ; le tableau est un choix). */
export const affichageEffectif = (etat: EtatProgramme): Affichage => etat.affichage ?? 'liste'
