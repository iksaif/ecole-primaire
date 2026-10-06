<template>
  <!--
    Choix de la police des fiches d'exercice (« Sur la fiche ») : une liste de polices script (incluses, installées,
    ajoutées depuis un fichier), l'aide pour en obtenir d'autres et l'ajout d'un fichier de police. Le choix est
    mémorisé (polices.ts) et lu par usePoliceFiche pour mettre en page la fiche.
    Sans propriété : le choix commun des fiches. Pour une affiche à polices par type : v-model (la valeur à la place du
    choix commun), `type` ('script' ou 'attache'), `libelle` (nom du choix) et `aide` (false : pas de seconde aide).
  -->
  <div class="choix-police">
    <div class="ligne">
      <label class="lib">{{ libelle || t('cadre.police') }}</label>
      <select :value="valeur" class="select" @change="valeur = ($event.target as HTMLSelectElement).value">
        <option v-for="p in liste" :key="p.id" :value="p.id">{{ libellePolice(p) }}</option>
      </select>
      <span class="exemple" :style="{ fontFamily: `'${valeur}'` }">{{ t(type === 'attache' ? 'cadre.exempleAttache' : 'cadre.exempleScript') }}</span>
      <button v-if="estPerso" class="btn-suppr" :title="t('cadre.retirer')" @click="supprimerPolicePerso(valeur)">🗑</button>
    </div>

    <details v-if="aide" class="aide">
      <summary>{{ t('cadre.aideTitre') }}</summary>
      <p v-html="t('cadre.aideTexte')"></p>
      <ul>
        <li v-for="l in LIENS_POLICES" :key="l.nom"><a :href="l.url" target="_blank" rel="noopener">{{ l.nom }}</a> — {{ tr({ fr: l.note, br: NOTES_BR[l.nom] ?? l.note }) }}</li>
      </ul>
      <div class="ajout">
        <label class="btn btn-ghost">{{ t('cadre.ajouterScript') }}
          <input type="file" accept=".ttf,.otf,.woff,.woff2" hidden @change="ajouter">
        </label>
      </div>
      <p v-if="erreur" class="erreur">{{ erreur }}</p>
    </details>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePolices, disponiblesDe } from './polices.ts'
import type { PoliceDisponible } from './polices.ts'
import type { TypePolice } from '../utils/impression.js'
import { LIENS_POLICES, ajouterPolicePerso, supprimerPolicePerso, policesPerso } from '../utils/impression.js'
import { useLangue } from '../langues/useLangue.ts'

const props = withDefaults(defineProps<{ type?: TypePolice, modelValue?: string, libelle?: string, aide?: boolean }>(), { type: 'script', modelValue: undefined, libelle: '', aide: true })
const emit = defineEmits<{ 'update:modelValue': [police: string] }>()
const { choix } = usePolices()
const liste = disponiblesDe(props.type)
// la police choisie : celle du parent (v-model), sinon le choix commun des fiches
const valeur = computed({
  get: () => props.modelValue ?? choix.value.unique,
  set: (v: string) => { if (props.modelValue === undefined) choix.value.unique = v; else emit('update:modelValue', v) },
})
const erreur = ref('')

// Textes de l'interface : section `cadre`. `tr` choisit entre des valeurs écrites en dur par langue (les textes ci-dessous,
// définis en français dans src/utils/impression.js et polices.ts), le français à défaut.
const { t, langue } = useLangue()
const tr = (valeurs: Record<string, string>): string => valeurs[langue.value] ?? valeurs.fr
// Textes définis en français dans src/utils/impression.js et polices.ts
const NOTES_BR: Record<string, string> = {
  'Belle Allure': "skritur a-stag implijet kalz er c'hlas, meur a stumm (GS, CP, CE…)",
  'Écolier': 'skritur a-stag klasel, stumm « court » evit lagadennoù bihan',
  'Cursif': 'ha nodrezhoù-skol all (rummad Script › Scolaire)',
}
const POLICES_BR: Record<string, string> = {
  'Playwrite FR Trad': 'Playwrite FR Trad — skritur a-stag skol Bro-C\'hall', // br: à relire
  'Andika': 'Andika — savet evit deskiñ lenn (a ha g eeun)',
  'Luciole': 'Luciole — lennus-tre, savet evit ar vugale a wel fall', // br: à relire
  'OpenDyslexic': 'OpenDyslexic — evit al lennerien dislekseg', // br: à relire
}
const ERREURS_BR: Record<string, string> = {
  'Fichier trop gros (3 Mo maximum)': "Re vras eo ar restr (3 Mo d'ar muiañ)",
  'Police chargée pour cette session, mais impossible de la mémoriser (stockage du navigateur plein)':
    "Karget eo an nodrezh evit an dro-mañ, met ne c'haller ket e virout (leun eo memor ar merdeer)", // br: à relire
}

function libellePolice(p: PoliceDisponible): string {
  return tr({ fr: p.label, br: POLICES_BR[p.id] ?? p.label.replace(/ \(installée\)$/, ' (staliet)').replace(/ \(ajoutée\)$/, ' (ouzhpennet)') })
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
    erreur.value = tr({ fr: message, br: ERREURS_BR[message] ?? message })
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
.aide summary { cursor: pointer; font-weight: 700; color: var(--bleu); }
.aide p, .aide ul { margin: .5rem 0; }
.aide ul { padding-left: 1.25rem; }
.ajout { display: flex; gap: .5rem; flex-wrap: wrap; margin: .75rem 0; }
.ajout .btn { font-size: .9rem; padding: .5rem 1rem; }
.note { font-size: .8rem; color: #888; }
.erreur { color: var(--rouge); font-weight: 700; }
</style>
