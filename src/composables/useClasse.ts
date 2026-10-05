import { ref, watch } from 'vue'
import { chargerValeur, sauvegarder } from '../utils'

// Classe choisie dans la barre du haut ('' = toutes), partagée par toutes les pages
const classe = ref(chargerValeur('classe', ''))
watch(classe, v => sauvegarder('classe', v))

export function useClasse() {
  return classe
}
