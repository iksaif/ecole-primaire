// Langue régionale, dans un composant :
//   const { code, def, donnees, reglage, proposees } = useLangueRegionale()
// `code` : la langue effectivement active ('' : aucune) ; `reglage` : le choix de l'utilisateur (modifiable) ; `donnees` :
// alphabet, nombres, listes de la langue active, ou undefined.
import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { SITE } from '../sites.ts'
import { regionaleEffective, reglageRegionale } from './etat.ts'
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

export function useLangueRegionale(): UtilisationRegionale {
  const def = computed<LangueDef<Langue> | undefined>(() => (regionaleEffective.value ? LANGUES[regionaleEffective.value] : undefined))
  return { code: regionaleEffective, reglage: reglageRegionale, def, donnees: computed(() => def.value?.donnees), proposees }
}
