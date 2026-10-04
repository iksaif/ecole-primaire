import { ref, computed, watch } from 'vue'
import { chargerReglages, sauvegarder } from '../utils'
import {
  POLICE_ATTACHE, POLICE_SCRIPT, POLICES_CONNUES, POLICES_INCLUSES,
  policesPerso, chargerPolices, policeInstallee,
} from '../utils/impression'

// Police choisie pour l'attaché et pour le script, commune à toutes les fiches
const choix = ref(chargerReglages('polices', { attache: POLICE_ATTACHE, script: POLICE_SCRIPT }))
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
  return { attache: liste('attache'), script: liste('script') }
})

// Si la police mémorisée n'est plus disponible (autre ordinateur…), on revient à celle incluse
watch([disponibles, pret], () => {
  if (!pret.value) return
  for (const type of ['attache', 'script']) {
    if (!disponibles.value[type].some(p => p.id === choix.value[type])) {
      choix.value[type] = POLICES_INCLUSES[type][0].id
    }
  }
})

export function usePolices() {
  detecter()
  return { choix, disponibles, pret, attache: computed(() => choix.value.attache), script: computed(() => choix.value.script) }
}
