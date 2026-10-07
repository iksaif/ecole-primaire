// Langue régionale, dans un composant :
//   const { code, def, donnees, reglage, proposees } = useLangueRegionale()
// `code` : la langue effectivement active ('' : aucune), celle du mode de langue de la barre du haut ; `reglage` : le choix de l'utilisateur (modifiable) ; `donnees` :
// alphabet, nombres, listes de la langue active, ou undefined.
import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { SITE } from '../sites.ts'
import { regionaleEffective, reglageRegionale } from './etat.ts'
import { regionaleActive } from '../contexte/useContexte.ts'
import { LANGUES } from './registre.ts'
import type { Langue } from './registre.ts'
import type { DonneesRegionales, LangueDef } from './types.ts'

export interface UtilisationRegionale {
  code: ComputedRef<Langue | ''>
  reglage: Ref<Langue | ''>
  def: ComputedRef<LangueDef<Langue> | undefined>
  donnees: ComputedRef<DonneesRegionales | undefined>
  /** langues régionales que le site permet d'activer */
  proposees: readonly LangueDef<Langue>[]
}

const proposees: readonly LangueDef<Langue>[] = SITE.languesRegionales.map(c => LANGUES[c])

// la langue régionale active : celle du mode de la barre du haut (contexte) ; sans contexte installé, l'ancien réglage
const active: ComputedRef<Langue | ''> = computed(() => {
  const duContexte = regionaleActive()
  return duContexte === undefined ? regionaleEffective.value : duContexte ?? ''
})

export function useLangueRegionale(): UtilisationRegionale {
  const def = computed<LangueDef<Langue> | undefined>(() => (active.value ? LANGUES[active.value] : undefined))
  return { code: active, reglage: reglageRegionale, def, donnees: computed(() => def.value?.donnees), proposees }
}

/** La langue régionale active ('' : aucune), hors composant (langueContenu.ts). */
export const langueRegionaleActive = (): Langue | '' => active.value
