<!--
  Choisir la langue du contenu d'un exercice (énoncés et fiche) : français ou langue régionale (src/noyau/langueContenu.ts). Montré par
  CadreExercice quand plus d'une langue est proposée ; rien sinon.
-->
<template>
  <div v-if="choix && choix.proposees.value.length > 1" class="config-section" role="group" :aria-labelledby="id" data-reglage="langue-contenu">
    <div :id="id" class="config-section-title">{{ t('cadre.langueContenu') }}</div>
    <div class="btn-group">
      <button v-for="l in choix.proposees.value" :key="l" type="button" class="level-btn" :data-valeur="l"
        :class="{ active: choix.langue.value === l }" :aria-pressed="choix.langue.value === l" @click="choix.choisir(l)">
        <Drapeau :langue="l" /> <span :lang="LANGUES[l].bcp47">{{ majuscule(LANGUES[l].nomLocal) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import Drapeau from '../shell/Drapeau.vue'
import { useLangue } from '../langues/useLangue.ts'
import { LANGUES } from '../langues/registre.ts'
import { majuscule } from '../ressources/composants/presentation.ts'
import { injectLangueContenu } from './langueContenu.ts'

const { t } = useLangue()
const id = useId()
const choix = injectLangueContenu()
</script>
