// Police des fiches d'exercice du noyau : celle choisie dans « Sur la fiche » (ChoixPolice), Andika par défaut, et les
// @font-face à embarquer dans la fiche. Le choix est mémorisé sous la clé `polices` (même format que l'ancien socle :
// { attache, script, unique }) ; les polices ajoutées depuis un fichier sont celles de utils/impression.js, partagées.
//
//   const police = usePoliceFiche()        // → fiche({ …, ...police.value })
import { ref, computed, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { chargerReglages, sauvegarder } from '../utils/index.js'
import {
  POLICE_ATTACHE, POLICE_SCRIPT, POLICES_CONNUES, POLICES_INCLUSES,
  policesPerso, chargerPolices, policeInstallee, cssPolices,
} from '../utils/impression.js'
import type { TypePolice } from '../utils/impression.js'

/** Police choisie pour l'attaché et pour le script ; `unique` : celle des documents qui n'ont qu'une police (les fiches). */
export type ChoixPolices = Record<TypePolice | 'unique', string>
/** Une police proposée dans les menus. */
export interface PoliceDisponible { id: string, label: string, perso?: boolean }
/** Ce que reçoit la mise en page d'une fiche : familles CSS du texte et @font-face à embarquer (documentFiche). */
export interface PoliceFiche { police: string, cssPolices: string }

const DEFAUT: ChoixPolices = { attache: POLICE_ATTACHE, script: POLICE_SCRIPT, unique: POLICE_SCRIPT }
const choix: Ref<ChoixPolices> = ref(chargerReglages('polices', DEFAUT))
watch(choix, v => sauvegarder('polices', v), { deep: true })

const installees: Ref<string[]> = ref([])
const installeesAttache: Ref<string[]> = ref([])
const pret = ref(false)
let detection: Promise<void> | null = null

// polices script installées sur l'ordinateur (détectées une fois que les polices incluses sont chargées)
function detecter() {
  detection ??= chargerPolices().then(() => {
    installees.value = POLICES_CONNUES.script.filter(policeInstallee)
    installeesAttache.value = POLICES_CONNUES.attache.filter(policeInstallee)
    pret.value = true
  })
  return detection
}

/** Les polices script proposées pour une fiche : incluses, installées, ajoutées depuis un fichier. */
export const disponibles: ComputedRef<PoliceDisponible[]> = computed(() => [
  ...POLICES_INCLUSES.script,
  ...installees.value.map(id => ({ id, label: `${id} (installée)` })),
  ...policesPerso.value.filter(p => p.type === 'script').map(p => ({ id: p.id, label: `${p.label} (ajoutée)`, perso: true })),
])

/** Les polices proposées pour un type d'écriture : incluses, installées, ajoutées depuis un fichier (affiches à polices par type). */
export function disponiblesDe(type: TypePolice): ComputedRef<PoliceDisponible[]> {
  if (type === 'script') return disponibles
  return computed(() => [
    ...POLICES_INCLUSES[type],
    ...installeesAttache.value.map(id => ({ id, label: `${id} (installée)` })),
    ...policesPerso.value.filter(p => p.type === type).map(p => ({ id: p.id, label: `${p.label} (ajoutée)`, perso: true })),
  ])
}

// Si la police mémorisée n'est plus disponible (autre ordinateur…), on revient à celle incluse
watch([disponibles, pret], () => {
  if (pret.value && !disponibles.value.some(p => p.id === choix.value.unique)) choix.value.unique = disponibles.value[0].id
})

/** La police des fiches, `unique` si elle est disponible, sinon Andika. */
export function policeDeFiche(): string {
  return disponibles.value.some(p => p.id === choix.value.unique) ? choix.value.unique : POLICE_SCRIPT
}

/**
 * Le choix et les polices proposées, pour le sélecteur. Le choix est relu à chaque appel : une page de l'ancien socle a
 * pu le changer entre-temps (elle garde sa propre copie, qui ne se met pas à jour en retour).
 */
export function usePolices() {
  detecter()
  const lu = chargerReglages('polices', DEFAUT)
  if (JSON.stringify(lu) !== JSON.stringify(choix.value)) choix.value = lu
  return { choix, disponibles, pret }
}

/** Police des fiches d'exercice (documentFiche) : familles CSS du texte et @font-face à embarquer. */
export function usePoliceFiche(): ComputedRef<PoliceFiche> {
  usePolices()
  return computed(() => {
    const id = policeDeFiche()
    const perso = policesPerso.value.find(p => p.id === id)
    return {
      police: `'${id}', Arial, sans-serif`,
      cssPolices: cssPolices() + (perso ? `\n@font-face { font-family: '${perso.id}'; src: url(${perso.dataUrl}); }` : ''),
    }
  })
}
