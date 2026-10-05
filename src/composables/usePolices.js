// @deprecated — remplacé par src/noyau/polices.ts, à supprimer avec le dernier exercice migré (plan 10)
import { ref, computed, watch } from 'vue'
import { chargerReglages, sauvegarder } from '../utils'
import {
  POLICE_ATTACHE, POLICE_SCRIPT, POLICES_CONNUES, POLICES_INCLUSES,
  policesPerso, chargerPolices, policeInstallee, cssPolices,
} from '../utils/impression'

// Police choisie pour l'attaché et pour le script, commune à toutes les fiches ; `unique` : celle des documents qui
// n'ont qu'une police (affiches du programme, nombres…), script par défaut mais une attachée est permise
const choix = ref(chargerReglages('polices', { attache: POLICE_ATTACHE, script: POLICE_SCRIPT, unique: POLICE_SCRIPT }))
watch(choix, v => sauvegarder('polices', v), { deep: true })

const installees = ref({ attache: [], script: [] })
const pret = ref(false)
let detection = null

function detecter() {
  detection ??= chargerPolices().then(() => {
    for (const type of ['attache', 'script']) {
      installees.value[type] = POLICES_CONNUES[type].filter(policeInstallee)
    }
    pret.value = true
  })
  return detection
}

const disponibles = computed(() => {
  const liste = type => [
    ...POLICES_INCLUSES[type],
    ...installees.value[type].map(id => ({ id, label: `${id} (installée)` })),
    ...policesPerso.value.filter(p => p.type === type).map(p => ({ id: p.id, label: `${p.label} (ajoutée)`, perso: true })),
  ]
  return { attache: liste('attache'), script: liste('script'), unique: [...liste('script'), ...liste('attache')] }
})

// Si la police mémorisée n'est plus disponible (autre ordinateur…), on revient à celle incluse
watch([disponibles, pret], () => {
  if (!pret.value) return
  for (const type of ['attache', 'script', 'unique']) {
    if (!disponibles.value[type].some(p => p.id === choix.value[type])) {
      choix.value[type] = disponibles.value[type][0].id
    }
  }
})

// Police d'un document à une seule police : `unique`, sauf une police attachée quand le document ne la permet pas
// (sa mise en page n'est faite que pour le script)
const policeUnique = (attachee = false) =>
  (attachee || disponibles.value.script.some(p => p.id === choix.value.unique) ? choix.value.unique : POLICE_SCRIPT)
// Polices d'un document qui utilise `types` (['attache', 'script'], ['script']…) : avec le script seul, c'est `unique`
const policesDe = types => ({
  attache: choix.value.attache,
  script: types.length === 1 && types[0] === 'script' ? policeUnique() : choix.value.script,
})

export function usePolices() {
  detecter()
  return {
    choix, disponibles, pret, policesDe, policeUnique,
    attache: computed(() => choix.value.attache), script: computed(() => choix.value.script),
  }
}

// Police des fiches d'exercice (documentFiche) : celle choisie dans « Sur la fiche » (ChoixPolice, choix `unique`
// partagé avec les autres fiches à une police), Andika par défaut, et les @font-face à embarquer dans la fiche.
//   const policeFiche = usePoliceFiche()   →   fiche({ …, ...policeFiche.value })
export function usePoliceFiche() {
  const { policeUnique } = usePolices()
  return computed(() => {
    const id = policeUnique()
    const perso = policesPerso.value.find(p => p.id === id)
    return {
      police: `'${id}', Arial, sans-serif`,
      cssPolices: cssPolices() + (perso ? `\n@font-face { font-family: '${perso.id}'; src: url(${perso.dataUrl}); }` : ''),
    }
  })
}
