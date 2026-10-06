// La présentation (cartes / liste) à afficher : celle du contexte (adresse, puis réglage de l'appareil, puis cartes), sauf que
// sur téléphone la liste, plus compacte, est conseillée tant que le lecteur n'a rien choisi (ni adresse, ni réglage, ni clic).
//   const { vue, apresChoix } = useVueAffichee()   // <SelecteurVue :vue="vue" @choisie="apresChoix" />
import { computed, onMounted, ref } from 'vue'
import type { ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import { useContexte } from '../../contexte/useContexte.ts'
import type { Vue } from '../../contexte/types.ts'
import { charger } from '../../utils/index.js'

/** Largeur (px) en dessous de laquelle l'écran est un téléphone. */
export const LARGEUR_TELEPHONE = 600

export function useVueAffichee(): { vue: ComputedRef<Vue>, apresChoix: () => void } {
  const { contexte } = useContexte()
  const route = useRoute()
  const telephone = ref(false)
  const choisi = ref(false)
  onMounted(() => { telephone.value = matchMedia(`(max-width: ${LARGEUR_TELEPHONE}px)`).matches })
  const explicite = computed(() => choisi.value || route.query.vue !== undefined || charger('vue') !== null)
  return {
    vue: computed(() => (telephone.value && !explicite.value ? 'liste' : contexte.value.vue)),
    apresChoix: () => { choisi.value = true },
  }
}
