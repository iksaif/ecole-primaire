// Le rendu des emojis de contenu à l'écran (les objets d'un exercice, en jeu) : la famille de la préférence « Images », toujours en
// couleur (le contour est fait pour le papier). Pour du HTML construit en chaîne (v-html) ; pour un emoji seul, <Emoji> suffit.
//   const images = useRenduEcran()            // ComputedRef<RenduImages>
//   v-html="htmlCollection(q.nb, q.emoji, images, 'objet')"
import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { creerRenduImages } from './rendu.ts'
import type { RenduImages } from './rendu.ts'
import { useImagesFiche } from './useImagesFiche.ts'

export function useRenduEcran(): ComputedRef<RenduImages> {
  const preference = useImagesFiche()
  return computed(() => creerRenduImages({ famille: preference.value.famille, style: 'couleur' }))
}
