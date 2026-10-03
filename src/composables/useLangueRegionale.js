import { ref, computed, watch } from 'vue'
import { charger, sauvegarder } from '../utils'
import { langueRegionale } from '../data/languesRegionales'
import { SITE } from '../site'

// Langue régionale activée sur tout le site ('' = aucune)
// Par défaut celle du site (breton sur skoolik.app)
const code = ref(charger('langue_regionale', SITE.langueRegionale))
watch(code, v => sauvegarder('langue_regionale', v))

export function useLangueRegionale() {
  return { code, langue: computed(() => langueRegionale(code.value)) }
}
