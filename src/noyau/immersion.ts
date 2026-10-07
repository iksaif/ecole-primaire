// Mode « immersion » : pendant une partie en ligne, l'interface du site (barre, pied de page, titre et fil d'Ariane de la page)
// s'efface pour laisser toute la place à la question. Le cadre de la question (QuestionJeu) l'active tant qu'il est affiché ;
// « Quitter » (ou Échap) rend la page normale, comme l'écran de résultats. Une seule source : `immersion`, lue par App.vue.
import { onMounted, onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'

const actif = ref(false)

/** Vrai pendant une partie en ligne (lecture seule). */
export const immersion: Readonly<Ref<boolean>> = actif

/** À appeler dans le composant affiché pendant la partie : l'immersion dure tant qu'il est monté. */
export function useImmersion(): void {
  onMounted(() => { actif.value = true })
  onUnmounted(() => { actif.value = false })
}
