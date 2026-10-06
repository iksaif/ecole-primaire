// Les récents de l'appareil (réactifs) : lus une fois, écrits à chaque ouverture d'un exercice.
//   const { recents } = useRecents()          // Recent[], du plus récent au plus ancien
//   enregistrerOuverture('exercice:heure')    // appelé par le routeur (src/router/index.ts) à l'arrivée sur la page d'un exercice
// Un exercice est « ouvert » quand sa route est visitée : le routeur connaît le registre (idsParRoute), les pages n'ont rien à faire.
import { ref } from 'vue'
import type { Ref } from 'vue'
import { charger, sauvegarder } from '../utils/index.js'
import { ajouterRecent, lireRecents } from './recents.ts'
import type { Recent } from './recents.ts'

const recents = ref<Recent[]>(lireRecents(charger('recents')))

export function enregistrerOuverture(id: string, maintenant: number = Date.now()): void {
  recents.value = ajouterRecent(recents.value, id, maintenant)
  sauvegarder('recents', recents.value)
}

export function useRecents(): { recents: Ref<Recent[]> } {
  return { recents }
}
