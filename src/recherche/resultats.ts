// Les résultats tels qu'on les montre : au plus quelques lignes par type, numérotées de haut en bas pour que le clavier et
// `aria-activedescendant` s'y retrouvent. Pur : lisible par node.
import type { EntreeRecherche, GroupeResultats } from './index.ts'
import type { TypeRessource } from '../ressources/types.ts'

/** Lignes montrées par type ; le reste est compté (« + 3 autres ») : affiner la recherche les fait venir. */
export const LIGNES_PAR_GROUPE = 5

export interface LigneAffichee {
  readonly entree: EntreeRecherche
  /** rang dans la liste à plat, de 0 : l'option du clavier */
  readonly position: number
}

export interface GroupeAffiche {
  readonly type: TypeRessource
  readonly lignes: readonly LigneAffichee[]
  /** résultats de ce type non montrés */
  readonly restants: number
}

export function groupesAffiches(groupes: readonly GroupeResultats[], max = LIGNES_PAR_GROUPE): readonly GroupeAffiche[] {
  let position = 0
  return groupes.map(g => ({
    type: g.type,
    lignes: g.resultats.slice(0, max).map(entree => ({ entree, position: position++ })),
    restants: Math.max(0, g.resultats.length - max),
  }))
}

/** Les lignes à plat, dans l'ordre de l'écran. */
export const aplatir = (groupes: readonly GroupeAffiche[]): readonly LigneAffichee[] => groupes.flatMap(g => g.lignes)
