<template>
  <!-- dessin partagé avec les pages statiques : src/data/drapeaux.js -->
  <span class="drapeau-c" v-html="(DRAPEAUX[langue] ?? DRAPEAUX.fr).svg"></span>
</template>

<script setup>
import { DRAPEAUX } from '../data/drapeaux'

defineProps({ langue: { type: String, default: 'fr' } })
</script>

<style scoped>
.drapeau-c { display: inline-flex; vertical-align: middle; }
.drapeau-c :deep(.drapeau) { width: 1.5em; height: 1em; border-radius: 2px; box-shadow: 0 0 0 1px rgba(0,0,0,.15); }
</style>
