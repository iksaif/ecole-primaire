// Réglages d'un exercice du noyau : lus, mémorisés, et ajustés au changement de niveau.
//
//   const { config, langueContenu } = useReglages(DEFINITION)
//   const T = contenu(TEXTES, () => langueContenu.value).t
//
// - config : réglages mémorisés (chargerReglages : un réglage absent ou du mauvais type reprend son défaut ; les clés de tous
//   les niveaux sont lues, pas seulement celles du niveau par défaut), ramenés
//   aux options proposées (reglagesDuNiveau : options du niveau et options communes `definition.options`) ;
//   sauvegardés à chaque modification, sous la clé `<id>_config` (« calcul-mental » → calcul_mental_config), la même
//   que l'ancien socle : les deux mondes lisent les mêmes préférences ;
// - changement de niveau : une seule politique, pour tous les exercices (reglagesApresNiveau, reglages.ts) ;
// - langueContenu : 'fr' pour un exercice de français (`contenu: 'fr'`), sinon la langue de l'interface ;
// - option `suivreClasse` (maternelle) : à l'ouverture, la classe choisie dans la barre du haut devient le niveau si
//   l'exercice la propose.
import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import { chargerReglages, chargerValeur, sauvegarder } from '../utils/index.js'
import { langue } from '../langues/etat.ts'
import { reglagesDuNiveau, reglagesApresNiveau, reglagesDeTousNiveaux, langueContenuDe } from './reglages.ts'
import type { Config, DefinitionExercice } from './types.ts'

/** Clé de mémorisation (localStorage) des réglages d'une définition : `<id>_config`, tirets en soulignés. */
export const cleReglages = (definition: { id: string }): string => `${definition.id.replaceAll('-', '_')}_config`

export function useReglages<R extends object>(
  definition: DefinitionExercice<R>,
  { cle = cleReglages(definition), suivreClasse = false }: { cle?: string, suivreClasse?: boolean } = {},
): { config: Ref<Config<R>>, langueContenu: Ref<string> } {
  // chargés avec les clés de TOUS les niveaux (sinon les réglages propres à un niveau autre que celui par défaut seraient perdus au
  // rechargement), puis ramenés à ceux du niveau lu
  const config = ref(reglagesDuNiveau(definition, chargerReglages(cle, reglagesDeTousNiveaux(definition as DefinitionExercice)))) as Ref<Config<R>>
  watch(config, v => sauvegarder(cle, v), { deep: true })
  watch(() => config.value.niveau, (niveau, avant) => {
    if (niveau !== avant) config.value = reglagesApresNiveau(definition, config.value, niveau)
  })
  if (suivreClasse) {
    // classe choisie dans la barre du haut ('' = toutes) : même clé que l'ancien socle (useClasse)
    const classe = chargerValeur('classe', '')
    if ((definition.niveaux as Record<string, unknown>)[classe]) config.value = { ...config.value, niveau: classe as Config<R>['niveau'] }
  }
  const langueContenu = computed(() => langueContenuDe(definition as DefinitionExercice, langue.value))
  return { config, langueContenu }
}
