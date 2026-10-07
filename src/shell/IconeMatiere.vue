<template>
  <!-- L'icône d'une matière : son emoji ; pour la langue régionale, son drapeau dessiné (le Gwenn-ha-du n'existe pas en emoji : 🏴 est
       le drapeau noir). Décorative : le nom de la matière est écrit à côté. -->
  <span class="icone-matiere" aria-hidden="true">
    <Drapeau v-if="drapeau" :langue="drapeau" />
    <template v-else>{{ EMOJI_MATIERE[matiere] }}</template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Drapeau from './Drapeau.vue'
import { SITE } from '../sites.ts'
import { EMOJI_MATIERE } from '../ressources/composants/presentation.ts'
import type { Langue } from '../langues/registre.ts'
import type { Matiere } from '../ressources/types.ts'

const props = defineProps<{
  matiere: Matiere
  /** la langue régionale de la page ; défaut : la première du site */
  langue?: Langue
}>()
const drapeau = computed<Langue | undefined>(() => (props.matiere === 'regionale' ? props.langue ?? SITE.languesRegionales[0] : undefined))
</script>

<style scoped>
.icone-matiere { display: inline-flex; align-items: center; }
</style>
