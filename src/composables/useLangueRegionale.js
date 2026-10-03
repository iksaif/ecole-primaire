import { ref, computed, watch } from 'vue'
import { charger, sauvegarder } from '../utils'
import { langueRegionale } from '../data/languesRegionales'
import { SITE } from '../site'
import { langue as langueInterface } from '../i18n'

// Langue régionale activée sur tout le site ('' = aucune)
// Par défaut celle du site (breton sur skoolik.app)
const code = ref(charger('langue_regionale', SITE.langueRegionale))
watch(code, v => sauvegarder('langue_regionale', v))

// Interface en breton → fonctions bretonnes activées d'office
const effectif = computed(() => code.value || (langueInterface.value === 'br' ? 'br' : ''))

export function useLangueRegionale() {
  return { code: effectif, reglage: code, langue: computed(() => langueRegionale(effectif.value)) }
}
