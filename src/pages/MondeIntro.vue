<template>
  <p class="intro">{{ t('monde.intro') }}</p>
</template>

<script setup lang="ts">
// Ce que Le Monde ajoute à la page de matière : une phrase d'introduction. Le quiz est une ressource comme les autres (src/exercices/quiz/),
// rangée par le catalogue dans les domaines du programme qu'il travaille.
import { useLangue } from '../langues/useLangue.ts'

const { t } = useLangue()
</script>

<style scoped>
.intro { color: var(--texte-doux); margin-bottom: 1rem; }
</style>
