// L'écran est-il assez large pour mettre deux colonnes côte à côte ? (CadreExercice : les réglages d'une fiche à gauche, l'aperçu à
// droite). Suit la fenêtre (matchMedia) ; faux là où matchMedia n'existe pas (node).
import { onMounted, onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'

/** Largeur de fenêtre (px) à partir de laquelle les réglages et l'aperçu d'une fiche tiennent côte à côte. */
export const LARGEUR_COTE_A_COTE = 1200

/** Vrai tant que la fenêtre fait au moins `largeur` pixels. */
export function useEcranLarge(largeur: number): Ref<boolean> {
  const requete = typeof matchMedia === 'function' ? matchMedia(`(min-width: ${largeur}px)`) : null
  const large = ref(requete?.matches ?? false)
  const suivre = (e: MediaQueryListEvent) => { large.value = e.matches }
  onMounted(() => requete?.addEventListener('change', suivre))
  onUnmounted(() => requete?.removeEventListener('change', suivre))
  return large
}
