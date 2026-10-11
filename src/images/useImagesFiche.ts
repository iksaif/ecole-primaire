// La préférence « Images » de l'appareil (famille, style : preference.ts), mémorisée sous la clé `images` comme la police l'est sous
// `polices`. Une seule préférence pour les fiches, les affiches et l'écran : choisie dans « Sur la fiche » (ChoixImages) ou dans le
// formulaire d'une affiche. À l'écran (<Emoji>), seule la famille compte : le contour est fait pour le papier.
// Ce module est léger (il n'importe pas les dessins) : le noyau le charge pour tous les exercices ; les dessins ne viennent qu'avec
// une fiche ou une affiche qui en rend (rendu.ts).
//
//   const images = useImagesFiche()            // Ref<ImagesFiche>, passée à la fiche (ParamsFiche.images) ou à l'affiche (config.images)
import { readonly, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { charger, chargerReglages, sauvegarder } from '../utils/index.js'
import { assainirIcones, assainirImages, DEFAUT_IMAGES } from './preference.ts'
import { fournirDessinsInterface } from './icone.ts'
import type { FamilleImages, ImagesFiche } from './preference.ts'

const CLE = 'images'

// chargerReglages vérifie le type de chaque champ, assainirImages ses valeurs (une famille inconnue reprend le défaut)
const preference: Ref<ImagesFiche> = ref(assainirImages(chargerReglages(CLE, DEFAUT_IMAGES)))
watch(preference, v => sauvegarder(CLE, v), { deep: true })

/** La préférence « Images », partagée par toutes les pages. */
export function useImagesFiche(): Ref<ImagesFiche> {
  return preference
}

// les icônes de l'interface : un réglage à part (clé `icones`), les emojis de l'appareil par défaut
const icones: Ref<FamilleImages> = ref(assainirIcones(charger('icones', null)))
watch(icones, v => sauvegarder('icones', v))

// leurs dessins OpenMoji : chargés seulement si on les choisit (le paquet principal ne les porte pas) ; `dessinsPrets` redessine les icônes
const dessinsPrets = ref(false)
let chargement: Promise<void> | null = null

/** Charge les dessins OpenMoji de l'interface, une seule fois. */
export function chargerDessinsInterface(): Promise<void> {
  chargement ??= import('./donnees/interface.ts').then(module => {
    fournirDessinsInterface(module.INTERFACE)
    dessinsPrets.value = true
  })
  return chargement
}

/** Vrai quand les dessins de l'interface sont arrivés : lu par les rendus qui doivent se refaire (Icone.vue, aperçu des réglages). */
export const dessinsInterfacePrets = readonly(dessinsPrets)

watch(icones, v => { if (v === 'openmoji') void chargerDessinsInterface() }, { immediate: true })

/** Le réglage des icônes de l'interface, partagé par toutes les pages (Icone.vue, page des réglages). */
export function useIconesInterface(): Ref<FamilleImages> {
  return icones
}
