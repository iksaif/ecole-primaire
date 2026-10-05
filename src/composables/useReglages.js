// Réglages d'un exercice au format « définition » (plan 10) : lus, mémorisés, et ajustés au changement de niveau.
//
//   const { config, langueContenu } = useReglages(DEFINITION, 'heure_config')
//   const T = contenu(TEXTES, () => langueContenu.value).t
//
// - config : réglages mémorisés (chargerReglages : un réglage absent ou du mauvais type reprend son défaut), ramenés
//   aux options proposées (reglagesDuNiveau : options du niveau et options communes `definition.options`) ;
//   sauvegardés à chaque modification ;
// - changement de niveau : une seule politique, pour tous les exercices (reglagesApresNiveau, src/exercices/outils.js) :
//   choix multiples → défauts du nouveau niveau ; choix unique gardé s'il est proposé et au programme ; le reste gardé ;
// - langueContenu : 'fr' pour un exercice de français (`contenu: 'fr'`), sinon la langue de l'interface.
import { ref, computed, watch } from 'vue'
import { chargerReglages, sauvegarder } from '../utils/index.js'
import { langue } from '../i18n/index.js'
import { reglagesDuNiveau, reglagesApresNiveau, langueContenuDe } from '../exercices/outils.js'

/**
 * @param {import('../exercices/index.js').DefinitionExercice} definition
 * @param {string} cle clé de mémorisation (localStorage), ex. 'heure_config' : ne change pas (réglages des visiteurs)
 */
export function useReglages(definition, cle) {
  const config = ref(reglagesDuNiveau(definition, chargerReglages(cle, reglagesDuNiveau(definition))))
  watch(config, v => sauvegarder(cle, v), { deep: true })
  watch(() => config.value.niveau, (niveau, avant) => {
    if (niveau !== avant) config.value = reglagesApresNiveau(definition, config.value, niveau)
  })
  const langueContenu = computed(() => langueContenuDe(definition, langue.value))
  return { config, langueContenu }
}
