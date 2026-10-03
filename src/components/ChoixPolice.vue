<template>
  <div class="choix-police">
    <div v-for="t in types" :key="t" class="ligne">
      <label class="lib">{{ tt(t === 'attache' ? 'attache' : 'script') }}</label>
      <select v-model="choix[t]" class="select">
        <option v-for="p in disponibles[t]" :key="p.id" :value="p.id">{{ libellePolice(p) }}</option>
      </select>
      <span class="exemple" :style="{ fontFamily: `'${choix[t]}'` }">{{ tt(t === 'attache' ? 'exempleAttache' : 'exempleScript') }}</span>
      <button v-if="estPerso(t)" class="btn-suppr" :title="tt('retirer')" @click="supprimer(t)">🗑</button>
    </div>

    <details class="aide">
      <summary>{{ tt('aideTitre') }}</summary>
      <p v-html="tt('aideTexte')"></p>
      <ul>
        <li v-for="l in LIENS_POLICES" :key="l.nom"><a :href="l.url" target="_blank" rel="noopener">{{ l.nom }}</a> — {{ langue === 'br' ? NOTES_BR[l.nom] ?? l.note : l.note }}</li>
      </ul>
      <div class="ajout">
        <label class="btn btn-ghost">{{ tt('ajouterAttache') }}
          <input type="file" accept=".ttf,.otf,.woff,.woff2" hidden @change="ajouter($event, 'attache')">
        </label>
        <label class="btn btn-ghost">{{ tt('ajouterScript') }}
          <input type="file" accept=".ttf,.otf,.woff,.woff2" hidden @change="ajouter($event, 'script')">
        </label>
      </div>
      <p class="note">{{ tt('astuce') }}</p>
      <p v-if="erreur" class="erreur">{{ erreur }}</p>
    </details>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePolices } from '../composables/usePolices'
import { LIENS_POLICES, ajouterPolicePerso, supprimerPolicePerso, policesPerso } from '../utils/impression'
import { useI18n } from '../i18n'

defineProps({ types: { type: Array, default: () => ['attache', 'script'] } })
const { choix, disponibles } = usePolices()
const erreur = ref('')

// tt : la variable « t » du template désigne déjà le type de police
const { t: tt, langue } = useI18n({
  fr: {
    attache: 'Attaché', script: 'Script',
    exempleAttache: 'belle école', exempleScript: 'a b g école',
    retirer: 'Retirer cette police',
    aideTitre: '➕ Utiliser Belle Allure, Écolier ou une autre police…',
    aideTexte: "Ces polices scolaires sont gratuites pour la classe et la maison, mais leur licence ne permet pas de les livrer avec le site. Deux solutions : les <strong>installer</strong> sur l'ordinateur (elles apparaîtront dans la liste après rechargement de la page), ou <strong>ajouter le fichier</strong> ici (il reste mémorisé dans ce navigateur).",
    ajouterAttache: '📂 Ajouter une police attachée',
    ajouterScript: '📂 Ajouter une police script',
    astuce: 'Astuce Belle Allure : choisis le fichier sans lignes (pas « Ductus » ni « Lignes ») ; la taille est ajustée automatiquement au lignage Seyès.',
  },
  br: {
    attache: 'A-stag', script: 'Skript',
    exempleAttache: 'skol vrav', exempleScript: 'a b g skol',
    // br: à relire — « nodrezh » pour police de caractères
    retirer: 'Lemel an nodrezh-mañ',
    aideTitre: '➕ Implijout Belle Allure, Écolier pe un nodrezh all…',
    // br: à relire
    aideTexte: "An nodrezhoù-skol-se a zo digoust evit ar c'hlas hag ar gêr, met n'eo ket aotreet gant o lañvaz o lakaat gant al lec'hienn. Daou zoare a zo : o <strong>staliañ</strong> war an urzhiataer (war wel e vint er roll goude bezañ adkarget ar bajenn), pe <strong>ouzhpennañ ar restr</strong> amañ (miret e vo er merdeer-mañ).",
    ajouterAttache: '📂 Ouzhpennañ un nodrezh a-stag',
    ajouterScript: '📂 Ouzhpennañ un nodrezh skript',
    astuce: "Alioù evit Belle Allure : dibab ar restr hep linennoù (ket « Ductus » na « Lignes ») ; ment al lizherennoù a vez azasaet ent emgefre ouzh al linennoù Seyès.",
  },
})
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

const estPerso = t => policesPerso.value.some(p => p.id === choix.value[t])

async function ajouter(e, type) {
  const f = e.target.files?.[0]
  e.target.value = ''
  if (!f) return
  erreur.value = ''
  try {
    choix.value[type] = await ajouterPolicePerso(f, type)
  } catch (err) {
    const message = err.message || String(err)
    erreur.value = langue.value === 'br' ? ERREURS_BR[message] ?? message : message
  }
}

function supprimer(t) {
  supprimerPolicePerso(choix.value[t])
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
