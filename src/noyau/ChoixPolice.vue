<!--
  Choix de la police des fiches d'exercice (« Sur la fiche ») : une liste de polices script (incluses, installées,
  ajoutées depuis un fichier), l'aide pour en obtenir d'autres et l'ajout d'un fichier de police. Le choix est
  mémorisé (polices.ts) et lu par usePoliceFiche pour mettre en page la fiche.
  Sans propriété : le choix commun des fiches. Pour une affiche à polices par type : v-model (la valeur à la place du
  choix commun), `type` ('script' ou 'attache'), `libelle` (nom du choix) et `aide` (false : pas de seconde aide).
  Textes : section `cadre` du catalogue typé (polices incluses, notes, erreurs d'ajout). Accessibilité : le <select> est
  relié à son libellé (for/id), l'erreur d'ajout est annoncée (role="alert").
-->
<template>
  <div class="choix-police">
    <div class="ligne">
      <label class="lib" :for="idSelect">{{ libelle || t('cadre.police') }}</label>
      <select :id="idSelect" :value="valeur" class="select" @change="valeur = ($event.target as HTMLSelectElement).value">
        <option v-for="p in liste" :key="p.id" :value="p.id">{{ libellePolice(p) }}</option>
      </select>
      <span class="exemple" aria-hidden="true" :style="{ fontFamily: `'${valeur}'` }">{{ t(type === 'attache' ? 'cadre.exempleAttache' : 'cadre.exempleScript') }}</span>
      <button v-if="estPerso" type="button" class="btn-suppr" :title="t('cadre.retirer')" :aria-label="t('cadre.retirer')" @click="supprimerPolicePerso(valeur)">🗑</button>
    </div>

    <details v-if="aide" class="aide">
      <summary>{{ t('cadre.aideTitre') }}</summary>
      <p><template v-for="(s, i) in aideSegments" :key="i"><strong v-if="s.fort">{{ s.texte }}</strong><template v-else>{{ s.texte }}</template></template></p>
      <ul>
        <li v-for="l in LIENS_POLICES" :key="l.nom"><a :href="l.url" target="_blank" rel="noopener">{{ l.nom }}</a> — {{ noteDe(l) }}</li>
      </ul>
      <div class="ajout">
        <label class="btn btn-ghost">{{ t('cadre.ajouterScript') }}
          <input type="file" accept=".ttf,.otf,.woff,.woff2" class="sr-only" @change="ajouter">
        </label>
      </div>
      <p v-if="erreur" class="erreur" role="alert">{{ erreur }}</p>
    </details>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useId } from 'vue'
import { usePolices, disponiblesDe } from './polices.ts'
import type { PoliceDisponible } from './polices.ts'
import type { TypePolice } from '../utils/impression.js'
import { LIENS_POLICES, ajouterPolicePerso, supprimerPolicePerso, policesPerso } from '../utils/impression.js'
import { useLangue } from '../langues/useLangue.ts'
import type { CleTexte } from '../langues/traduire.ts'

type CleCadre = Extract<CleTexte, `cadre.${string}`>

const props = withDefaults(defineProps<{ type?: TypePolice, modelValue?: string, libelle?: string, aide?: boolean }>(), { type: 'script', modelValue: undefined, libelle: '', aide: true })
const emit = defineEmits<{ 'update:modelValue': [police: string] }>()
const { choix } = usePolices()
const liste = disponiblesDe(props.type)
const idSelect = useId()
// la police choisie : celle du parent (v-model), sinon le choix commun des fiches
const valeur = computed({
  get: () => props.modelValue ?? choix.value.unique,
  set: (v: string) => { if (props.modelValue === undefined) choix.value.unique = v; else emit('update:modelValue', v) },
})
const erreur = ref('')
const { t } = useLangue()
// le texte d'aide contient des <strong>…</strong> : on le découpe plutôt que d'utiliser v-html (aucun HTML injecté)
const aideSegments = computed(() => t('cadre.aideTexte').split(/(<strong>.*?<\/strong>)/)
  .map(s => (s.startsWith('<strong>') ? { fort: true, texte: s.slice(8, -9) } : { fort: false, texte: s })))

// Textes écrits en français dans src/utils/impression.js (polices incluses, liens, erreurs) : clé du catalogue par id, nom ou message
const POLICES_INCLUSES: Record<string, CleCadre> = {
  'Playwrite FR Trad': 'cadre.policeAttache', Andika: 'cadre.policeAndika', Luciole: 'cadre.policeLuciole', OpenDyslexic: 'cadre.policeOpenDyslexic',
}
const NOTES: Record<string, CleCadre> = { 'Belle Allure': 'cadre.noteBelleAllure', 'Écolier': 'cadre.noteEcolier', Cursif: 'cadre.noteCursif' }
const ERREURS: Record<string, CleCadre> = {
  'Fichier trop gros (3 Mo maximum)': 'cadre.erreurPoliceTropGrosse',
  'Police chargée pour cette session, mais impossible de la mémoriser (stockage du navigateur plein)': 'cadre.erreurPoliceNonMemorisee',
}

function libellePolice(p: PoliceDisponible): string {
  const cle = POLICES_INCLUSES[p.id]
  if (cle) return t(cle)
  return p.statut && p.nom ? `${p.nom} (${t(`cadre.${p.statut}`)})` : p.label
}
function noteDe(l: { nom: string, note: string }): string {
  const cle = NOTES[l.nom]
  return cle ? t(cle) : l.note
}

const estPerso = computed(() => policesPerso.value.some(p => p.id === valeur.value))

async function ajouter(e: Event) {
  const entree = e.target as HTMLInputElement
  const f = entree.files?.[0]
  entree.value = ''
  if (!f) return
  erreur.value = ''
  try {
    valeur.value = await ajouterPolicePerso(f, props.type)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const cle = ERREURS[message]
    erreur.value = cle ? t(cle) : message
  }
}
</script>

<style scoped>
.ligne { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; margin-bottom: .5rem; }
.lib { font-weight: 700; min-width: 4.5rem; }
.select {
  flex: 1; min-width: 200px; font: inherit; padding: .45rem .6rem;
  border: 2px solid var(--gris-brd); border-radius: 8px; background: white;
}
.exemple { font-size: 1.6rem; min-width: 9rem; line-height: 1.6; }
.btn-suppr { border: none; background: none; cursor: pointer; font-size: 1.1rem; }
.aide { margin-top: .5rem; font-size: .9rem; color: #555; }
.aide summary { cursor: pointer; font-weight: 700; color: var(--bleu-fort); }
.aide p, .aide ul { margin: .5rem 0; }
.aide ul { padding-left: 1.25rem; }
.ajout { display: flex; gap: .5rem; flex-wrap: wrap; margin: .75rem 0; }
.ajout .btn { font-size: .9rem; padding: .5rem 1rem; }
.ajout .btn:focus-within { outline: 3px solid var(--bleu-fort); outline-offset: 2px; }
.erreur { color: var(--rouge-texte); font-weight: 700; }
</style>
