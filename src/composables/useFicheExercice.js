// Fiche imprimable d'un exercice au format « définition » (plan 10) : mode jouer / imprimer, graine, police, tirage.
//
//   const { mode, fiche, nouvelle } = useFicheExercice({
//     tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
//     mettreEnPage: (questions, police) => ficheHeure({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
//   })
//   <ConfigExercice v-model:mode="mode" :fiche="fiche" police @regenerer="nouvelle" …>
//
// Le tirage n'est calculé qu'en mode « imprimer », et recalculé quand un réglage lu par `tirer` change ou qu'on demande
// une nouvelle fiche (nouvelle graine) ; la mise en page est à part : changer de police (« Sur la fiche ») ne retire
// pas de questions, le flux de la graine n'avance pas. Graine : ?graine= du lien, sinon tirée (useGraine).
import { computed } from 'vue'
import { useModeExercice } from './useModeExercice.js'
import { useGraine } from './useGraine.js'
import { usePoliceFiche } from './usePolices.js'

/**
 * @param {{ tirer: (rng: object) => any, mettreEnPage: (questions: any, police: object) => string }} fonctions
 */
export function useFicheExercice({ tirer, mettreEnPage }) {
  const { mode } = useModeExercice()
  const { graine, nouvelle, rngFiche } = useGraine()
  // police choisie dans « Sur la fiche » (Andika par défaut) : { police, cssPolices }
  const police = usePoliceFiche()
  const tirage = computed(() => {
    if (mode.value !== 'imprimer') return null
    graine.value
    return tirer(rngFiche())
  })
  const fiche = computed(() => (tirage.value ? mettreEnPage(tirage.value, police.value) : ''))
  return { mode, fiche, nouvelle, graine }
}
