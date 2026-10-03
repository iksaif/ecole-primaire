import { ref, watch } from 'vue'
import { charger, sauvegarder } from '../utils'

// Classe choisie dans la barre du haut ('' = toutes), partagée par toutes les pages
const classe = ref(charger('classe', ''))
watch(classe, v => sauvegarder('classe', v))

export function useClasse() {
  return classe
}
