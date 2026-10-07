// Langue du CONTENU d'un exercice (énoncés, fiche) quand il suit la langue (`contenu: 'interface'`). Par défaut : la langue affichée. Avec
// une langue régionale active (« Fr + Br », « breton seul »), on choisit le français ou la langue régionale : <ChoixLangueContenu>, que le
// cadre de l'exercice (CadreExercice) montre de lui-même. Le choix est mémorisé (clé `langue_contenu`, commun à tous les exercices) et
// ne vaut que là où il est proposé. Un exercice de français (`contenu: 'fr'`) reste en français : rien n'est proposé.
//
//   useReglages(DEFINITION) → langueContenu (ci-dessous, langueContenuProposee) ; le cadre lit le choix par injectLangueContenu().
// Un lien peut demander une langue : `?contenu=br` (les cartes « aussi en breton » de la page de la langue régionale).
import { ref, computed, watch, provide, inject } from 'vue'
import { useRoute } from 'vue-router'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { chargerValeur, sauvegarder } from '../utils/index.js'
import { langueAffichee } from '../langues/etat.ts'
import { langueRegionaleActive } from '../langues/useLangueRegionale.ts'
import { estLangue, LANGUE_SOURCE } from '../langues/registre.ts'
import type { Langue } from '../langues/registre.ts'
import type { DefinitionExercice } from './types.ts'

/** Le choix mémorisé ('' : suivre la langue affichée). */
const choix: Ref<string> = ref(chargerValeur<string>('langue_contenu', ''))
watch(choix, v => sauvegarder('langue_contenu', v))

/** Ce que le cadre de l'exercice reçoit : les langues proposées, celle du contenu, et de quoi la changer. */
export interface LangueContenu {
  proposees: ComputedRef<readonly Langue[]>
  langue: ComputedRef<string>
  choisir: (l: Langue) => void
}
const CLE: InjectionKey<LangueContenu> = Symbol('langueContenu')

/** Les langues proposées pour un exercice : la langue affichée, le français et la langue régionale active, sans doublon. */
function proposeesPour(definition: DefinitionExercice): Langue[] {
  if (definition.contenu === 'fr') return []
  const candidates = [langueAffichee.value, LANGUE_SOURCE, langueRegionaleActive()]
  return [...new Set(candidates.filter(estLangue))]
}

/**
 * La langue du contenu d'un exercice, et le choix offert à son cadre (provide : appelé par useReglages, dans le setup de la vue qui contient
 * CadreExercice).
 */
export function langueContenuProposee(definition: DefinitionExercice): ComputedRef<string> {
  const proposees = computed(() => proposeesPour(definition))
  // un lien qui demande une langue (`?contenu=br`, page de la langue régionale) la choisit, si elle est proposée
  const demandee = useRoute()?.query.contenu
  if (typeof demandee === 'string' && proposees.value.some(l => l === demandee)) choix.value = demandee
  const langue = computed(() => {
    if (definition.contenu === 'fr') return LANGUE_SOURCE
    const voulue = proposees.value.find(l => l === choix.value)
    return voulue ?? langueAffichee.value
  })
  provide(CLE, { proposees, langue, choisir: l => { choix.value = l } })
  return langue
}

/** Pour le cadre : le choix de langue de l'exercice qui le contient (null hors d'un exercice du noyau). */
export const injectLangueContenu = (): LangueContenu | null => inject(CLE, null)
