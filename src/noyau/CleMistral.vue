<!--
  La clé Mistral, facultative (src/noyau/mistral.ts) : son état, le champ pour la saisir, Effacer, et ce qu'on promet (elle reste sur
  l'appareil, elle ne part que vers api.mistral.ai). `utilite` : à quoi elle sert dans l'exercice (« pour générer des phrases variées ») ;
  `sansCle` : ce que l'exercice fait sans elle (« phrases prédéfinies »).
    <CleMistral :utilite="t('dictee.cleApiOpt')" :sans-cle="t('dictee.cleAucune')" />
-->
<template>
  <div class="config-section cle-mistral">
    <div class="config-section-title">{{ t('cadre.mistral.titre') }} <span class="cle-opt">{{ utilite }}</span></div>
    <p class="api-etat" :class="{ aucune: !cleSaisie }">{{ cleSaisie ? t('cadre.mistral.ok') : sansCle }}</p>
    <form class="api-row" @submit.prevent="enregistrer">
      <label class="sr-only" :for="id">{{ t('cadre.mistral.saisie') }}</label>
      <input :id="id" v-model="champ" type="password" autocomplete="off" :placeholder="t('cadre.mistral.saisie')">
      <button type="submit" class="btn btn-ghost" :disabled="!champ.trim()">{{ t('cadre.mistral.enregistrer') }}</button>
      <button v-if="cleSaisie" type="button" class="btn btn-ghost" @click="effacer">{{ t('cadre.mistral.effacer') }}</button>
    </form>
    <p class="api-aide">{{ t('cadre.mistral.confidentialite') }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { cleMistral, enregistrerCleMistral } from './mistral.ts'

defineProps<{ utilite: string, sansCle: string }>()
const { t } = useLangue()
const id = useId()
const cleSaisie = ref(!!cleMistral())
const champ = ref('')
function enregistrer(): void { enregistrerCleMistral(champ.value); champ.value = ''; cleSaisie.value = !!cleMistral() }
function effacer(): void { enregistrerCleMistral(''); cleSaisie.value = false }
</script>

<style scoped>
.cle-opt { font-weight: 400; color: #aaa; font-size: .85em; }
.api-row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.api-etat { font-size: .85rem; font-weight: 700; color: var(--vert-texte); margin: 0 0 .4rem; }
.api-etat.aucune { color: var(--texte-doux); }
.api-row input { flex: 1; min-width: 12rem; padding: .4rem .6rem; border: 2px solid var(--gris-brd); border-radius: 8px; font: inherit; }
.api-aide { font-size: .8rem; color: var(--texte-doux); margin: .4rem 0 0; }
.api-row .btn { font-size: .85rem; }
</style>
