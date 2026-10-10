// La préférence « Images » de l'appareil (famille, style : preference.ts), mémorisée sous la clé `images` comme la police l'est sous
// `polices`. Une seule préférence pour les fiches, les affiches et l'écran : choisie dans « Sur la fiche » (ChoixImages) ou dans le
// formulaire d'une affiche. À l'écran (<Emoji>), seule la famille compte : le contour est fait pour le papier.
// Ce module est léger (il n'importe pas les dessins) : le noyau le charge pour tous les exercices ; les dessins ne viennent qu'avec
// une fiche ou une affiche qui en rend (rendu.ts).
//
//   const images = useImagesFiche()            // Ref<ImagesFiche>, passée à la fiche (ParamsFiche.images) ou à l'affiche (config.images)
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { chargerReglages, sauvegarder } from '../utils/index.js'
import { assainirImages, DEFAUT_IMAGES } from './preference.ts'
import type { ImagesFiche } from './preference.ts'

const CLE = 'images'

// chargerReglages vérifie le type de chaque champ, assainirImages ses valeurs (une famille inconnue reprend le défaut)
const preference: Ref<ImagesFiche> = ref(assainirImages(chargerReglages(CLE, DEFAUT_IMAGES)))
watch(preference, v => sauvegarder(CLE, v), { deep: true })

/** La préférence « Images », partagée par toutes les pages. */
export function useImagesFiche(): Ref<ImagesFiche> {
  return preference
}
