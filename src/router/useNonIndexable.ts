// Une page dont le contenu est introuvable (fiche ou compétence inconnue) répond 200 depuis nginx : elle se déclare `noindex`.
// Le routeur remet l'indexation de la page suivante à chaque navigation (poserIndexation).
import { watchEffect } from 'vue'
import { poserNonIndexable } from './canonique.ts'

/** Tant que `introuvable()` est vrai, la page n'a ni canonical ni droit à l'indexation. */
export function useNonIndexable(introuvable: () => boolean): void {
  watchEffect(() => { if (introuvable()) poserNonIndexable() })
}
