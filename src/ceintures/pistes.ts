// Les pistes de ceintures fournies : une suite de ceintures sur une compétence ou un exercice (plans/15-ceintures.md §3). Données pures :
// les objectifs de chaque ceinture sont des textes de contenu (src/exercices/ceintures/textes.ts, `piste.<id>.objectifs`, un objectif par ceinture, séparés par « | »).
// `libre` : l'enseignant·e écrit ses objectifs (un par ligne). Plus tard, chaque piste dira à quel exercice et à quels réglages mène son brevet.
export const IDS_PISTES = ['tables', 'calcul-mental', 'lettres'] as const
export type IdPiste = (typeof IDS_PISTES)[number]

/** Le choix « piste » de l'activité : une piste fournie, ou `libre`. */
export const CHOIX_PISTE = [...IDS_PISTES, 'libre'] as const
export type ChoixPiste = (typeof CHOIX_PISTE)[number]

/** Au plus autant d'objectifs que de ceintures dans la plus longue palette. */
export const MAX_OBJECTIFS = 8

/** Les objectifs d'un texte « un par ligne » ou « séparés par | » : sans lignes vides, au plus MAX_OBJECTIFS. */
export function objectifsDe(texte: string): string[] {
  return String(texte).split(/\n|\|/).map(s => s.trim()).filter(Boolean).slice(0, MAX_OBJECTIFS)
}
