// Fiche imprimable d'un exercice du noyau : mode jouer / imprimer, graine, police, tirage.
//
//   const { mode, fiche, nouvelle } = useFicheExercice({
//     tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
//     mettreEnPage: (questions, police) => ficheHeure({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
//   })
//   <CadreExercice v-model:mode="mode" :fiche="fiche" @regenerer="nouvelle" …>
//
// Le tirage n'est calculé qu'en mode « imprimer », et recalculé quand un réglage lu par `tirer` change ou qu'on demande
// une nouvelle fiche (nouvelle graine) ; la mise en page est à part : changer de police (« Sur la fiche ») ne retire
// pas de questions, le flux de la graine n'avance pas. Graine : ?graine= du lien, sinon tirée (useGraine).
// Le mode est porté par l'URL (?mode=imprimer) : la page « À imprimer » y mène directement, et changer de mode garde
// tous les réglages.
import { computed } from 'vue'
import type { WritableComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGraine } from './useGraine.ts'
import { usePoliceFiche } from './polices.ts'
import type { PoliceFiche } from './polices.ts'
import type { Rng } from '../utils/hasard.ts'

/** 'jouer' : faire l'exercice à l'écran ; 'imprimer' : fiche papier. */
export type ModeExercice = 'jouer' | 'imprimer'

export function useModeExercice(): WritableComputedRef<ModeExercice> {
  const route = useRoute()
  const router = useRouter()
  return computed<ModeExercice>({
    get: () => (route.query.mode === 'imprimer' ? 'imprimer' : 'jouer'),
    set: m => { router.replace({ query: { ...route.query, mode: m === 'imprimer' ? 'imprimer' : undefined } }) },
  })
}

/**
 * Q : ce que tire `tirer` (les questions de la fiche). mettreEnPage rend le document HTML complet.
 */
export function useFicheExercice<Q>({ tirer, mettreEnPage }: {
  tirer: (rng: Rng) => Q
  mettreEnPage: (questions: Q, police: PoliceFiche) => string
}) {
  const mode = useModeExercice()
  const { graine, nouvelle, rngFiche } = useGraine()
  // police choisie dans « Sur la fiche » (Andika par défaut)
  const police = usePoliceFiche()
  const tirage = computed<Q | null>(() => {
    if (mode.value !== 'imprimer') return null
    graine.value   // relancer le tirage quand la graine change
    return tirer(rngFiche())
  })
  const fiche = computed(() => (tirage.value ? mettreEnPage(tirage.value, police.value) : ''))
  return { mode, fiche, nouvelle, graine }
}
