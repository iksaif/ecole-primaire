<!--
  « Ajouter une police » sous le sélecteur (ChoixPolice) : l'aide pour obtenir les polices scolaires suggérées (seulement
  celles qui manquent : rien si tout est installé), l'ajout d'un fichier de police, et l'accès aux polices « normales » de
  l'ordinateur — liste complète (queryLocalFonts, Chrome et Edge : permission demandée, rien ne sort de l'appareil) ou, pour
  tous les navigateurs, le nom d'une police installée, vérifié par mesure sur canvas. `choisir` reçoit la police ajoutée.
  Accessibilité : <details> natif, champs et boutons natifs avec libellé, messages annoncés (role="status" / "alert").
-->
<template>
  <details class="aide">
    <summary>{{ t('cadre.aideTitre') }}</summary>
    <div v-if="liens.length" class="manquantes">
      <p>
        <template v-for="(s, i) in aideSegments" :key="i"><strong v-if="s.fort">{{ s.texte }}</strong><template v-else>{{ s.texte }}</template></template>
      </p>
      <p class="sous-titre">{{ t('cadre.aideLiens') }}</p>
      <ul>
        <li v-for="l in liens" :key="l.nom"><a :href="l.url" target="_blank" rel="noopener">{{ l.nom }}</a> — {{ noteDe(l) }}</li>
      </ul>
    </div>
    <div class="actions">
      <label class="btn btn-ghost">{{ t('cadre.ajouterFichier') }}
        <input type="file" accept=".ttf,.otf,.woff,.woff2" class="sr-only" @change="ajouterFichier">
      </label>
      <button v-if="peutLister" type="button" class="btn btn-ghost" @click="lister">{{ t('cadre.toutesPolices') }}</button>
    </div>
    <form class="nom" @submit.prevent="chercher">
      <label :for="idNom">{{ t('cadre.nomPolice') }}</label>
      <input :id="idNom" v-model="nom" type="text" class="champ" autocomplete="off" spellcheck="false" maxlength="80">
      <button type="submit" class="btn btn-ghost" :disabled="!nom.trim()">{{ t('cadre.chercherPolice') }}</button>
    </form>
    <p v-if="message" class="message" role="status">{{ message }}</p>
    <p v-if="erreur" class="erreur" role="alert">{{ erreur }}</p>
  </details>
</template>

<script setup lang="ts">
import { ref, computed, useId } from 'vue'
import type { TypePolice } from '../utils/impression.js'
import { LIENS_POLICES, ajouterPolicePerso } from '../utils/impression.js'
import { ajouterPoliceInstallee, listerPolicesSysteme } from './polices.ts'
import { useLangue } from '../langues/useLangue.ts'
import type { CleTexte } from '../langues/traduire.ts'

// les clés sans paramètre (celles à `{n}`, `{nom}` demandent leurs valeurs)
type CleCadre = Exclude<Extract<CleTexte, `cadre.${string}`>, 'cadre.toutesTrouvees' | 'cadre.nomTrouvee' | 'cadre.nomIntrouvable'>

const props = defineProps<{ type: TypePolice, manquantes: string[] }>()
const emit = defineEmits<{ choisir: [police: string] }>()
const { t } = useLangue()
const idNom = useId()
const nom = ref('')
const message = ref('')
const erreur = ref('')
const peutLister = 'queryLocalFonts' in window

// l'aide ne parle que de ce qui manque (rien si tout est installé)
const liens = computed(() => LIENS_POLICES.filter(l => props.manquantes.includes(l.nom)))
// le texte d'aide contient des <strong>…</strong> : on le découpe plutôt que d'utiliser v-html (aucun HTML injecté)
const aideSegments = computed(() => t('cadre.aideTexte').split(/(<strong>.*?<\/strong>)/)
  .map(s => (s.startsWith('<strong>') ? { fort: true, texte: s.slice(8, -9) } : { fort: false, texte: s })))

// Textes écrits en français dans src/utils/impression.js (notes, erreurs) : clé du catalogue par nom ou message
const NOTES: Record<string, CleCadre> = { 'Belle Allure': 'cadre.noteBelleAllure', 'Écolier': 'cadre.noteEcolier', Cursif: 'cadre.noteCursif' }
const ERREURS: Record<string, CleCadre> = {
  'Fichier trop gros (3 Mo maximum)': 'cadre.erreurPoliceTropGrosse',
  'Police chargée pour cette session, mais impossible de la mémoriser (stockage du navigateur plein)': 'cadre.erreurPoliceNonMemorisee',
}
const noteDe = (l: { nom: string, note: string }): string => { const cle = NOTES[l.nom]; return cle ? t(cle) : l.note }

async function ajouterFichier(e: Event) {
  const entree = e.target as HTMLInputElement
  const f = entree.files?.[0]
  entree.value = ''
  if (!f) return
  message.value = erreur.value = ''
  try {
    emit('choisir', await ajouterPolicePerso(f, props.type))
  } catch (err) {
    const texte = err instanceof Error ? err.message : String(err)
    const cle = ERREURS[texte]
    erreur.value = cle ? t(cle) : texte
  }
}

async function lister() {
  message.value = erreur.value = ''
  try {
    const n = await listerPolicesSysteme()
    if (n !== null) message.value = t('cadre.toutesTrouvees', { n })
  } catch {
    erreur.value = t('cadre.toutesRefusees')
  }
}

function chercher() {
  message.value = erreur.value = ''
  const n = nom.value.trim()
  if (ajouterPoliceInstallee(n)) {
    message.value = t('cadre.nomTrouvee', { nom: n })
    emit('choisir', n)
    nom.value = ''
  } else erreur.value = t('cadre.nomIntrouvable', { nom: n })
}
</script>

<style scoped>
.aide { margin-top: .5rem; font-size: .9rem; color: var(--texte); }
.aide summary { cursor: pointer; font-weight: 700; color: var(--bleu-fort); min-height: 44px; display: flex; align-items: center; }
.aide p, .aide ul { margin: .5rem 0; }
.aide ul { padding-left: 1.25rem; }
.sous-titre { font-weight: 700; }
.actions, .nom { display: flex; gap: .5rem .75rem; flex-wrap: wrap; align-items: center; margin: .75rem 0; }
.btn { font-size: .9rem; padding: .5rem 1rem; min-height: 44px; display: inline-flex; align-items: center; cursor: pointer; }
.btn:focus-within { outline: 3px solid var(--bleu-fort); outline-offset: 2px; }
.champ { flex: 1; min-width: 12rem; font: inherit; min-height: 44px; padding: .45rem .6rem; border: 2px solid var(--gris-brd); border-radius: 8px; }
.message { font-weight: 700; color: var(--texte); }
.erreur { color: var(--rouge-texte); font-weight: 700; }
</style>
