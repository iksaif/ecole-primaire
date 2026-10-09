// « Peut-on afficher X ? » : LE point d'entrée des listes (matières, accueil, compétences, programme, recherche, fiches voisines…) pour savoir si une
// ressource est montrée. Aujourd'hui une seule raison de cacher : sa traduction n'est pas assez sûre pour le réglage de l'utilisateur
// (src/langues/confianceReglage.ts), et seulement si le mode de langue montre la traduction. D'autres raisons s'ajouteront ici, pas dans les pages.
//   const { affichables, affichable, filtrer, masque, traduite } = useAffichable()
// En développement (AVEC_DEV), tout est affichable : `masque(r)` dit ce que le réglage aurait caché (pour la pastille).
import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useContexte } from '../contexte/useContexte.ts'
import { AVEC_DEV } from '../dev.ts'
import { confianceMin } from '../langues/confianceReglage.ts'
import type { NiveauConfiance } from '../langues/confiance.ts'
import { traductionAssezSure, traductionMontree } from './filtres.ts'
import type { AvecTraduction } from './filtres.ts'
import { useRessources } from './useRessources.ts'
import type { RessourceDeContenu } from './types.ts'

/** Ce qu'il faut savoir d'un élément de liste (ressource du catalogue ou entrée de l'index des fiches). */
export type Affichable = AvecTraduction

export interface UtilisationAffichable {
  /** l'élément est-il montré ? (toujours en développement) */
  affichable: (x: Affichable) => boolean
  /** le réglage le cacherait-il ? (vrai aussi en développement : c'est ce que dit la pastille « masquée ») */
  masque: (x: Affichable) => boolean
  /** la liste, sans ce qui n'est pas affichable */
  filtrer: <T extends Affichable>(liste: readonly T[]) => T[]
  /** le niveau à montrer sur l'élément (pastille), `null` si sa traduction n'est pas lue dans ce mode */
  traduite: (x: Affichable) => NiveauConfiance | null
  /** le catalogue complet des ressources, sans ce qui n'est pas affichable : à lire à la place de `catalogue` dans les listes */
  affichables: ComputedRef<readonly RessourceDeContenu[]>
}

export function useAffichable(): UtilisationAffichable {
  const { contexte } = useContexte()
  const { catalogue } = useRessources()
  const verifie = (x: Affichable, seuil: number): boolean => traductionAssezSure(x, contexte.value.mode, contexte.value.regionale, seuil)
  const affichable = (x: Affichable): boolean => AVEC_DEV || verifie(x, confianceMin.value)
  const masque = (x: Affichable): boolean => !verifie(x, confianceMin.value)
  const traduite = (x: Affichable): NiveauConfiance | null => (traductionMontree(x, contexte.value.mode, contexte.value.regionale) ? (x.confiance ?? null) : null)
  const filtrer = <T extends Affichable>(liste: readonly T[]): T[] => liste.filter(affichable)
  return { affichable, masque, filtrer, traduite, affichables: computed(() => filtrer(catalogue.value)) }
}
