import { computed } from 'vue'
import { langueRegionale } from '../data/languesRegionales'
import { regionaleEffective, reglageRegionale } from '../langues/etat.ts'

// Ancien socle : l'état vit désormais dans src/langues/etat.ts (voir aussi src/langues/useLangueRegionale.ts)
export function useLangueRegionale() {
  return { code: regionaleEffective, reglage: reglageRegionale, langue: computed(() => langueRegionale(regionaleEffective.value)) }
}
