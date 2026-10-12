// Les réglages communs des ceintures dans le navigateur : un `ref` mémorisé sur l'appareil (clé `ceintures`), comme la police (noyau/polices.ts) et les images.
//   const reglages = useCeintures()      // reglages.value.palette, .style, .noirEtBlanc…
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { charger, sauvegarder } from '../utils/index.js'
import { assainirCeintures } from './reglages.ts'
import type { ReglagesCeintures } from './types.ts'

const reglages: Ref<ReglagesCeintures> = ref(assainirCeintures(charger('ceintures')))
watch(reglages, v => sauvegarder('ceintures', assainirCeintures(v)), { deep: true })

export function useCeintures(): Ref<ReglagesCeintures> {
  return reglages
}
