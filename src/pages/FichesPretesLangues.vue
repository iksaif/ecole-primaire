<template>
  <!-- Les langues d'une fiche, en drapeaux (leur nom, pour les lecteurs d'écran, est celui du drapeau). Une fiche en français seul n'en montre pas. -->
  <span v-if="visibles.length" class="drapeaux"><Drapeau v-for="l in visibles" :key="l" :langue="l" /></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LANGUE_SOURCE, estLangue } from '../langues/registre.ts'
import Drapeau from '../shell/Drapeau.vue'

const props = defineProps<{ langues: readonly string[], toujours?: boolean }>()
/** `toujours` : même le français seul (là où la page dit dans quelle langue sont les fiches : le mode bilingue). */
const visibles = computed(() => (!props.toujours && props.langues.length === 1 && props.langues[0] === LANGUE_SOURCE ? [] : props.langues.filter(estLangue)))
</script>

<style scoped>
.drapeaux { display: inline-flex; gap: .2rem; align-items: center; }
</style>
