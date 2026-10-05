<template>
  <!-- dessin du drapeau : src/langues/<code>/drapeau.ts (le SVG est écrit par nous, sans donnée de l'utilisateur) -->
  <span class="drapeau-c" v-html="LANGUES[langue].drapeau"></span>
</template>

<script setup lang="ts">
import { LANGUES } from '../langues/registre.ts'
import type { Langue } from '../langues/registre.ts'

defineProps<{ langue: Langue }>()
</script>

<style scoped>
.drapeau-c { display: inline-flex; vertical-align: middle; }
.drapeau-c :deep(.drapeau) { width: 1.5em; height: 1em; border-radius: 2px; box-shadow: 0 0 0 1px rgba(0,0,0,.15); }
</style>
