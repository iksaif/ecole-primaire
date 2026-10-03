<template>
  <!-- Volontairement en français : s'affiche la première fois que l'interface passe en breton -->
  <div v-if="ouvert" class="fond" @click.self="fermer">
    <div class="modale" role="dialog" aria-modal="true" aria-labelledby="avis-titre" lang="fr">
      <h2 id="avis-titre"><Drapeau langue="br" /> L'interface en breton</h2>
      <p>
        La traduction bretonne du site a été faite <strong>automatiquement</strong> et n'a pas encore été relue
        par un brittophone : il reste sûrement des erreurs ou des tournures maladroites.
      </p>
      <p>
        Les nombres, l'alphabet, les jours et les mois des fiches ont été vérifiés dans des dictionnaires, mais
        tout retour est le bienvenu — une faute, une formulation plus naturelle, un mot utilisé à l'école…
      </p>
      <p class="contact">✉️ Écrivez-moi : <a :href="`mailto:${CONTACT}?subject=Traduction%20bretonne`">{{ CONTACT }}</a></p>
      <p class="merci">Trugarez ! Merci !</p>
      <div class="actions">
        <button class="btn btn-ghost" @click="langue = 'fr'; fermer()">Revenir en français</button>
        <button class="btn btn-primary" @click="fermer">D'accord, continuer en breton</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Drapeau from './Drapeau.vue'
import { langue } from '../i18n'
import { CONTACT } from '../site'
import { charger, sauvegarder } from '../utils'

const ouvert = ref(false)
watch(langue, l => {
  if (l === 'br' && !charger('avis_traduction_vu', false)) ouvert.value = true
}, { immediate: true })

function fermer() {
  ouvert.value = false
  sauvegarder('avis_traduction_vu', true)
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
