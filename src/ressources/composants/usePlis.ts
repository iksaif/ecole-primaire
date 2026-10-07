// Le pli des domaines (réactif), partagé par tous les groupes de la page et mémorisé sur l'appareil (clé `plis`).
import { ref } from 'vue'
import { charger, sauvegarder } from '../../utils/index.js'
import { avecPli, estOuvert, lirePlis } from './pli.ts'
import type { Plis } from './pli.ts'
import type { DomaineId } from '../types.ts'
import type { PLUSIEURS_DOMAINES } from '../filtres.ts'

const plis = ref<Plis>(lirePlis(charger('plis')))

export function usePlis() {
  return {
    ouvert: (domaine: DomaineId | typeof PLUSIEURS_DOMAINES, replieParDefaut: boolean): boolean => estOuvert(domaine, replieParDefaut, plis.value),
    definir: (domaine: DomaineId | typeof PLUSIEURS_DOMAINES, ouvert: boolean): void => {
      plis.value = avecPli(plis.value, domaine, ouvert)
      sauvegarder('plis', plis.value)
    },
  }
}
