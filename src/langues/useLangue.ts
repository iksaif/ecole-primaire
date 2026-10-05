// Langue de l'interface, dans un composant :
//   const { t, langue, langues } = useLangue()
//   t('nav.accueil')                       → texte dans la langue courante (clé typée)
//   t('reglages.remise.fait', { n: 3 })    → paramètres et pluriel typés
// `t` lit la langue courante : un gabarit ou un computed qui l'appelle se met à jour au changement de langue.
import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { SITE } from '../sites.ts'
import { langue } from './etat.ts'
import { LANGUES } from './registre.ts'
import type { Langue } from './registre.ts'
import { traduire, traduireListe } from './traduire.ts'
import type { CatalogueSource, CleTexte, CleListe } from './traduire.ts'
import type { ArgsParams, FeuilleA, LangueDef } from './types.ts'

export interface UtilisationLangue {
  /** langue de l'interface (modifiable : `langue.value = 'br'`) */
  langue: Ref<Langue>
  /** définition de la langue courante */
  def: ComputedRef<LangueDef<Langue>>
  /** langues d'interface proposées par le site */
  langues: readonly LangueDef<Langue>[]
  t: <C extends CleTexte>(cle: C, ...args: ArgsParams<FeuilleA<CatalogueSource, C>>) => string
  liste: (cle: CleListe) => readonly string[]
}

const langues: readonly LangueDef<Langue>[] = SITE.languesInterface.map(c => LANGUES[c])

export function useLangue(): UtilisationLangue {
  return {
    langue,
    def: computed(() => LANGUES[langue.value]),
    langues,
    t: (cle, ...args) => traduire(langue.value, cle, ...args),
    liste: cle => traduireListe(langue.value, cle),
  }
}
