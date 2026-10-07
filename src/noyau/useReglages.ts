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
// - langueContenu : 'fr' pour un exercice de français (`contenu: 'fr'`), sinon la langue choisie dans le cadre (français ou langue
//   régionale, langueContenu.ts), par défaut la langue affichée ;
// - option `suivreClasse` (maternelle) : à l'ouverture, la classe choisie dans la barre du haut devient le niveau si
//   l'exercice la propose.
// - profil « enfant » (classe verrouillée) : le niveau est toujours sa classe, si l'exercice la propose.
// - lien d'une fiche publiée (« Personnaliser » : `?fiche=<id>&niveau=<classe>`) : l'exercice s'ouvre réglé comme cette fiche, puis
//   l'adresse oublie `fiche` (les changements suivants sont mémorisés comme d'habitude).
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Ref } from 'vue'
import { chargerReglages, chargerValeur, sauvegarder } from '../utils/index.js'
import { classeVerrouillee } from '../contexte/useContexte.ts'
import { reglagesDuNiveau, reglagesApresNiveau, reglagesDeTousNiveaux } from './reglages.ts'
import { langueContenuProposee } from './langueContenu.ts'
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
  // profil « enfant » : le niveau est figé sur sa classe verrouillée, si l'exercice la propose (ChoixReglage ne montre plus les niveaux)
  const fige = classeVerrouillee()
  if (fige && (definition.niveaux as Record<string, unknown>)[fige]) config.value = { ...config.value, niveau: fige as Config<R>['niveau'] }
  appliquerFicheDuLien(definition, config)
  const langueContenu = langueContenuProposee(definition as DefinitionExercice)
  return { config, langueContenu }
}

/** `?fiche=<id>&niveau=<classe>` : les réglages de cette fiche de `definition.fiches`, puis `fiche` et `niveau` retirés de l'adresse. */
function appliquerFicheDuLien<R extends object>(definition: DefinitionExercice<R>, config: Ref<Config<R>>): void {
  const route = useRoute()
  const id = route?.query.fiche
  if (typeof id !== 'string') return
  const router = useRouter()
  const niveau = route.query.niveau
  const fiche = definition.fiches.find(f => f.id === id && (typeof niveau !== 'string' || f.niveau === niveau))
  if (fiche) config.value = reglagesDuNiveau(definition, { niveau: fiche.niveau, ...fiche.reglages })
  const reste = { ...route.query }
  delete reste.fiche
  delete reste.niveau
  void router.replace({ query: reste })
}
