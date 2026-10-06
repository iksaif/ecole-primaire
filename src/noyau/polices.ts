// Police des fiches d'exercice du noyau : celle choisie dans « Sur la fiche » (ChoixPolice), Andika par défaut, et les
// @font-face à embarquer dans la fiche. Le choix est mémorisé sous la clé `polices` (même format que l'ancien socle :
// { attache, script, unique }) ; les polices ajoutées depuis un fichier sont celles de utils/impression.js, partagées.
//
//   const police = usePoliceFiche()        // → fiche({ …, ...police.value })
import { ref, computed, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { charger, chargerReglages, sauvegarder } from '../utils/index.js'
import {
  POLICE_ATTACHE, POLICE_SCRIPT, POLICES_CONNUES, POLICES_INCLUSES,
  policesPerso, chargerPolices, policeInstallee, cssPolices,
} from '../utils/impression.js'
import type { TypePolice } from '../utils/impression.js'
import { regrouper, selectionnables, choixValide, assainirNoms, nomPoliceValide, POLICE_REPLI } from './groupesPolices.ts'
import type { EntreePolice, GroupesPolices } from './groupesPolices.ts'

/** Police choisie pour l'attaché et pour le script ; `unique` : celle des documents qui n'ont qu'une police (les fiches). */
export type ChoixPolices = Record<TypePolice | 'unique', string>
/** Ce que reçoit la mise en page d'une fiche : familles CSS du texte et @font-face à embarquer (documentFiche). */
export interface PoliceFiche { police: string, cssPolices: string }

const DEFAUT: ChoixPolices = { attache: POLICE_ATTACHE, script: POLICE_SCRIPT, unique: POLICE_SCRIPT }
const choix: Ref<ChoixPolices> = ref(chargerReglages('polices', DEFAUT))
watch(choix, v => sauvegarder('polices', v), { deep: true })

// Polices de l'ordinateur choisies ou saisies : leurs noms sont mémorisés à part (clé `polices_systeme`, une liste de noms) ;
// à la relecture, seuls les noms encore détectés comme installés sont gardés (une police désinstallée retombe sur Andika).
const systemeMemo: Ref<string[]> = ref([])
// toutes les polices du système, listées à la demande (queryLocalFonts) : pour la session seulement
const systemeListe: Ref<string[]> = ref([])
const connuesInstallees: Ref<Set<string>> = ref(new Set())
const pret = ref(false)
let detection: Promise<void> | null = null

// polices suggérées installées sur l'ordinateur (détectées une fois que les polices incluses sont chargées)
function detecter() {
  detection ??= chargerPolices().then(() => {
    connuesInstallees.value = new Set([...POLICES_CONNUES.script, ...POLICES_CONNUES.attache].filter(policeInstallee))
    systemeMemo.value = assainirNoms(charger('polices_systeme', [])).filter(policeInstallee)
    pret.value = true
  })
  return detection
}

/** Un type d'écriture, ou `tous` : le choix des fiches, qui n'ont qu'une police (script et attaché confondus). */
export type TypeChoix = TypePolice | 'tous'
const typesDe = (type: TypeChoix): TypePolice[] => (type === 'tous' ? ['script', 'attache'] : [type])

function groupesCalcules(type: TypeChoix): GroupesPolices {
  const types = typesDe(type)
  return regrouper({
    incluses: types.flatMap(t => POLICES_INCLUSES[t]),
    connues: types.flatMap(t => POLICES_CONNUES[t]).map(nom => ({ nom, installee: connuesInstallees.value.has(nom) })),
    systeme: [...systemeMemo.value, ...systemeListe.value],
    ajoutees: policesPerso.value.filter(p => types.includes(p.type)).map(p => ({ id: p.id, label: p.label })),
  })
}

/** Les polices d'un type d'écriture, en groupes (favorites, installées, ajoutées, manquantes) : pour le sélecteur. */
export function groupesDe(type: TypeChoix): ComputedRef<GroupesPolices> {
  return computed(() => groupesCalcules(type))
}

/** Les polices sélectionnables pour un type d'écriture (celles de tous les groupes, sauf les manquantes). */
export function disponiblesDe(type: TypeChoix): ComputedRef<EntreePolice[]> {
  return computed(() => selectionnables(groupesCalcules(type)))
}
// les fiches n'ont qu'une police : toutes celles que l'on connaît
const disponibles = disponiblesDe('tous')

/**
 * Ajoute des polices de l'ordinateur à la liste et les mémorise : les noms viennent de la saisie ou du système, et sont
 * déjà contrôlés par l'appelant (policeInstallee) ; ceux qui ne sont pas des noms valides sont ignorés.
 */
export function memoriserSysteme(noms: string[]): void {
  systemeMemo.value = assainirNoms([...systemeMemo.value, ...noms])
  sauvegarder('polices_systeme', systemeMemo.value)
}

/**
 * Liste toutes les polices de l'ordinateur (Chrome, Edge : demande une permission, rien ne sort de l'appareil).
 * Renvoie leur nombre, ou null si l'API n'existe pas ; une permission refusée lève une erreur.
 */
export async function listerPolicesSysteme(): Promise<number | null> {
  const lister = (window as Window & { queryLocalFonts?: () => Promise<{ family: string }[]> }).queryLocalFonts
  if (!lister) return null
  const familles = await lister.call(window)
  systemeListe.value = assainirNoms([...new Set(familles.map(f => f.family))])
  return systemeListe.value.length
}

/** Cherche une police installée par son nom : l'ajoute (et la mémorise) si elle est détectée ; sinon renvoie false. */
export function ajouterPoliceInstallee(nom: string): boolean {
  const n = nom.trim()
  if (!nomPoliceValide(n) || !policeInstallee(n)) return false
  memoriserSysteme([n])
  return true
}

// Si la police mémorisée n'est plus disponible (autre ordinateur…), on revient à celle incluse
watch([disponibles, pret], () => {
  if (pret.value && !disponibles.value.some(p => p.id === choix.value.unique)) choix.value.unique = POLICE_REPLI
})

/** La police des fiches, `unique` si elle est disponible, sinon Andika. */
export function policeDeFiche(): string {
  return choixValide(choix.value.unique, groupesCalcules('tous'), POLICE_SCRIPT)
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
