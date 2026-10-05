<template>
  <!-- Volontairement en français (la langue source) : s'affiche la première fois que l'interface passe dans une langue
       dont la traduction n'a pas été relue -->
  <div v-if="ouvert" class="fond" @click.self="fermer">
    <div class="modale" role="dialog" aria-modal="true" aria-labelledby="avis-titre" lang="fr">
      <h2 id="avis-titre"><Drapeau :langue="langue" /> {{ tf('avis.titre', { langue: nom }) }}</h2>
      <p>{{ tf('avis.p1', { langue: nom }) }}</p>
      <p>{{ tf('avis.p2') }}</p>
      <p class="contact">{{ tf('avis.contact') }} <a :href="`mailto:${SITE.contact}?subject=${encodeURIComponent(`Traduction ${nom}`)}`">{{ SITE.contact }}</a></p>
      <p class="merci">{{ tf('avis.merci') }}</p>
      <div class="actions">
        <button class="btn btn-ghost" @click="revenir">{{ tf('avis.revenir', { langue: nomSource }) }}</button>
        <button class="btn btn-primary" @click="fermer">{{ tf('avis.continuer', { langue: nom }) }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Drapeau from './Drapeau.vue'
import { SITE } from '../sites.ts'
import { langue } from '../langues/etat.ts'
import { LANGUES, LANGUE_SOURCE, nomDeLangue } from '../langues/registre.ts'
import { contenu } from '../langues/traduire.ts'
import { charger, sauvegarder } from '../utils/index.js'

// texte de l'avis : toujours dans la langue source
const tf = contenu(LANGUE_SOURCE).t
const nom = computed(() => nomDeLangue(langue.value, LANGUE_SOURCE))
const nomSource = nomDeLangue(LANGUE_SOURCE, LANGUE_SOURCE)

const ouvert = ref(false)
const cle = (l: string) => `avis_traduction_vu_${l}`
watch(langue, l => {
  if (!LANGUES[l].traductionRelue && !charger(cle(l), false) && !charger('avis_traduction_vu', false)) ouvert.value = true
}, { immediate: true })

function fermer() {
  ouvert.value = false
  sauvegarder(cle(langue.value), true)
  sauvegarder('avis_traduction_vu', true)
}
function revenir() {
  langue.value = LANGUE_SOURCE
  fermer()
}
</script>

<style scoped>
.fond { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modale { background: white; border-radius: var(--radius); box-shadow: 0 10px 40px rgba(0,0,0,.3); max-width: 520px; padding: 1.5rem 1.75rem; }
h2 { display: flex; align-items: center; gap: .6rem; font-size: 1.3rem; margin-bottom: .75rem; }
p { margin: .6rem 0; line-height: 1.5; color: #444; }
.contact a { font-weight: 700; color: var(--bleu); }
.merci { font-weight: 700; color: #333; }
.actions { display: flex; gap: .5rem; justify-content: flex-end; flex-wrap: wrap; margin-top: 1rem; }
</style>
