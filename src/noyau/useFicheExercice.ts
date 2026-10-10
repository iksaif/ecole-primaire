// Fiche imprimable d'un exercice du noyau : mode jouer / imprimer, graine, police, tirage.
//
//   const { mode, fiche, nouvelle } = useFicheExercice({
//     tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
//     mettreEnPage: (questions, police) => ficheHeure({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
//   })
// `police` porte aussi `images`, la préférence « Images » (ParamsFiche.images) ; une fiche qui dessine des emojis (imagesDe) demande
// le choix dans « Sur la fiche » avec <CadreExercice images>.
//   <CadreExercice v-model:mode="mode" :fiche="fiche" @regenerer="nouvelle" …>
//
// Le tirage n'est calculé qu'en mode « imprimer ». C'est une FONCTION de la graine et des réglages : un `rng` neuf, créé
// d'après la graine, à chaque calcul (jamais un flux qui continue d'un calcul à l'autre) ; Jouer → Imprimer → Jouer →
// Imprimer redonne donc la même fiche. Il est recalculé quand un réglage lu par `tirer` change ou qu'on demande une nouvelle
// fiche (nouvelle graine, écrite dans l'URL). La mise en page est à part : changer de police (« Sur la fiche ») ne retire
// pas de questions. Graine : ?graine= du lien, sinon tirée à l'ouverture (useGraine).
// Le mode est porté par l'URL (?mode=imprimer) : la page « À imprimer » y mène directement, et changer de mode garde
// tous les réglages.
import { computed } from 'vue'
import type { WritableComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGraine } from './useGraine.ts'
import { creerRng } from '../utils/hasard.ts'
import { usePoliceFiche } from './polices.ts'
import type { PoliceFiche } from './polices.ts'
import { useImagesFiche } from '../images/useImagesFiche.ts'
import type { ImagesFiche } from '../images/preference.ts'
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

/** Ce que reçoit la mise en page en plus des questions : la police et les images choisies dans « Sur la fiche ». */
export type MiseEnPageFiche = PoliceFiche & { images: ImagesFiche }

/**
 * Q : ce que tire `tirer` (les questions de la fiche). mettreEnPage rend le document HTML complet.
 */
export function useFicheExercice<Q>({ tirer, mettreEnPage, ficheSeule = false }: {
  tirer: (rng: Rng) => Q
  mettreEnPage: (questions: Q, police: MiseEnPageFiche) => string
  /** exercice « fiche seule » (`definition.jeu === false`) : le mode est toujours 'imprimer', ?mode= est ignoré (<CadreExercice fiche-seule>) */
  ficheSeule?: boolean
}) {
  const modeUrl = useModeExercice()
  const mode: WritableComputedRef<ModeExercice> = ficheSeule
    ? computed<ModeExercice>({ get: (): ModeExercice => 'imprimer', set: () => {} })
    : modeUrl
  const { graine, nouvelle } = useGraine()
  // police choisie dans « Sur la fiche » (Andika par défaut)
  const police = usePoliceFiche()
  // images choisies dans « Sur la fiche » (OpenMoji en couleur par défaut)
  const images = useImagesFiche()
  const tirage = computed<Q | null>(() => {
    if (mode.value !== 'imprimer') return null
    return tirer(creerRng(graine.value))   // lit graine.value : le tirage est relancé quand elle change
  })
  const fiche = computed(() => {
    if (!tirage.value) return ''
    return mettreEnPage(tirage.value, { ...police.value, images: images.value })
  })
  return { mode, fiche, nouvelle, graine }
}
