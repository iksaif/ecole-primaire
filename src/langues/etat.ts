// État partagé des préférences de langue : langue de l'interface et langue régionale, mémorisées dans le navigateur
// sous les mêmes clés qu'avant (`ep_langue_interface`, `ep_langue_regionale`). Les valeurs par défaut, et les langues
// permises, viennent du site (src/sites.ts). Utilisé par useLangue() et useLangueRegionale() ; un seul état pour toute l'app.
import { ref, computed, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { chargerValeur, sauvegarder } from '../utils/index.js'
import { SITE } from '../sites.ts'
import { LANGUES, estLangue, estRegionale } from './registre.ts'
import type { Langue } from './registre.ts'

/** Langue de l'interface (une des langues proposées par le site). */
export const langue: Ref<Langue> = ref(SITE.langueInterface)
{
  const lue = chargerValeur<string>('langue_interface', SITE.langueInterface)
  if (estLangue(lue) && SITE.languesInterface.includes(lue)) langue.value = lue
}
watch(langue, v => {
  sauvegarder('langue_interface', v)
  if (typeof document !== 'undefined') document.documentElement.lang = LANGUES[v].bcp47
}, { immediate: true })

/** Réglage de langue régionale ('' : aucune), tel que choisi (ou celui du site). */
export const reglageRegionale: Ref<Langue | ''> = ref(SITE.langueRegionale)
{
  const lue = chargerValeur<string>('langue_regionale', SITE.langueRegionale)
  if (lue === '' || (estLangue(lue) && SITE.languesRegionales.includes(lue))) reglageRegionale.value = lue
}
watch(reglageRegionale, v => sauvegarder('langue_regionale', v))

/**
 * Langue régionale effective : le réglage ; sinon, si l'interface est elle-même dans une langue régionale du site, cette
 * langue (ses fonctions sont activées d'office) ; sinon aucune.
 */
export const regionaleEffective: ComputedRef<Langue | ''> = computed(() =>
  reglageRegionale.value || (estRegionale(langue.value) && SITE.languesRegionales.includes(langue.value) ? langue.value : ''))
