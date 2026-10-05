<!-- @deprecated — remplacé par src/noyau/ChoixPolice.vue, à supprimer avec le dernier exercice migré (plan 10) -->
<template>
  <div class="choix-police">
    <div v-for="t in lignes" :key="t" class="ligne">
      <label class="lib">{{ tt(lignes.length === 1 ? 'police' : t === 'attache' ? 'attache' : 'script') }}</label>
      <select :value="valeur(t)" class="select" @change="choix[t] = $event.target.value">
        <option v-for="p in liste(t)" :key="p.id" :value="p.id">{{ libellePolice(p) }}</option>
      </select>
      <span class="exemple" :style="{ fontFamily: `'${valeur(t)}'` }">{{ tt(t === 'attache' ? 'exempleAttache' : 'exempleScript') }}</span>
      <button v-if="estPerso(t)" class="btn-suppr" :title="tt('retirer')" @click="supprimer(t)">🗑</button>
    </div>

    <details v-if="!belleAllure" class="aide">
      <summary>{{ tt('aideTitre') }}</summary>
      <p v-html="tt('aideTexte')"></p>
      <ul>
        <li v-for="l in LIENS_POLICES" :key="l.nom"><a :href="l.url" target="_blank" rel="noopener">{{ l.nom }}</a> — {{ langue === 'br' ? NOTES_BR[l.nom] ?? l.note : l.note }}</li>
      </ul>
      <div class="ajout">
        <label v-if="types.includes('attache')" class="btn btn-ghost">{{ tt('ajouterAttache') }}
          <input type="file" accept=".ttf,.otf,.woff,.woff2" hidden @change="ajouter($event, 'attache')">
        </label>
        <label v-if="types.includes('script')" class="btn btn-ghost">{{ tt('ajouterScript') }}
          <input type="file" accept=".ttf,.otf,.woff,.woff2" hidden @change="ajouter($event, 'script')">
        </label>
      </div>
      <p v-if="types.includes('attache')" class="note">{{ tt('astuce') }}</p>
      <p v-if="erreur" class="erreur">{{ erreur }}</p>
    </details>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePolices } from '../composables/usePolices'
import { LIENS_POLICES, ajouterPolicePerso, supprimerPolicePerso, policesPerso } from '../utils/impression'
import { useI18n } from '../i18n'
import messagesFr from '../i18n/fr/components/ChoixPolice.js'
import messagesBr from '../i18n/br/components/ChoixPolice.js'

// types : polices utilisées par le document. Le script seul → un seul choix, « Police » (`unique` dans usePolices),
// parmi les polices script, et aussi les attachées si `attachee` (mise en page prévue pour elles)
const props = defineProps({ types: { type: Array, default: () => ['attache', 'script'] }, attachee: Boolean })
const lignes = computed(() => (props.types.length === 1 && props.types[0] === 'script' ? ['unique'] : props.types))
const { choix, disponibles, policeUnique } = usePolices()
const liste = t => (t === 'unique' && !props.attachee ? disponibles.value.script : disponibles.value[t])
const valeur = t => (t === 'unique' ? policeUnique(props.attachee) : choix.value[t])
// Belle Allure déjà là (installée ou ajoutée) : l'aide pour l'obtenir est inutile
const belleAllure = computed(() => disponibles.value.attache.some(p => /belle[ _-]?allure/i.test(p.id)))
const erreur = ref('')

// tt : la variable « t » du template désigne déjà le type de police
const { t: tt, langue } = useI18n({ fr: messagesFr, br: messagesBr })
// Textes définis en français dans src/utils/impression.js et src/composables/usePolices.js
const NOTES_BR = {
  'Belle Allure': "skritur a-stag implijet kalz er c'hlas, meur a stumm (GS, CP, CE…)",
  'Écolier': 'skritur a-stag klasel, stumm « court » evit lagadennoù bihan',
  'Cursif': 'ha nodrezhoù-skol all (rummad Script › Scolaire)',
}
const POLICES_BR = {
  'Playwrite FR Trad': 'Playwrite FR Trad — skritur a-stag skol Bro-C\'hall', // br: à relire
  'Andika': 'Andika — savet evit deskiñ lenn (a ha g eeun)',
  'Luciole': 'Luciole — lennus-tre, savet evit ar vugale a wel fall', // br: à relire
  'OpenDyslexic': 'OpenDyslexic — evit al lennerien dislekseg', // br: à relire
}
const ERREURS_BR = {
  'Fichier trop gros (3 Mo maximum)': "Re vras eo ar restr (3 Mo d'ar muiañ)",
  'Police chargée pour cette session, mais impossible de la mémoriser (stockage du navigateur plein)':
    "Karget eo an nodrezh evit an dro-mañ, met ne c'haller ket e virout (leun eo memor ar merdeer)", // br: à relire
}
function libellePolice(p) {
  if (langue.value !== 'br') return p.label
  return POLICES_BR[p.id] ?? p.label.replace(/ \(installée\)$/, ' (staliet)').replace(/ \(ajoutée\)$/, ' (ouzhpennet)')
}

const estPerso = t => policesPerso.value.some(p => p.id === valeur(t))

async function ajouter(e, type) {
  const f = e.target.files?.[0]
  e.target.value = ''
  if (!f) return
  erreur.value = ''
  try {
    choix.value[type === 'script' && lignes.value[0] === 'unique' ? 'unique' : type] = await ajouterPolicePerso(f, type)
  } catch (err) {
    const message = err.message || String(err)
    erreur.value = langue.value === 'br' ? ERREURS_BR[message] ?? message : message
  }
}

function supprimer(t) {
  supprimerPolicePerso(valeur(t))
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
