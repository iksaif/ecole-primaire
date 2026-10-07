<template>
  <!-- Les langues d'une fiche, en drapeaux (leur nom, pour les lecteurs d'écran, est celui du drapeau). Sur une carte ou une ligne (`regionales`),
       une fiche en français seul n'a pas de drapeau ; une fiche dans une langue régionale montre toutes ses langues, pour distinguer la version
       bilingue de la version en langue régionale seule (même titre). Ailleurs (filtre, « même fiche »), tous. -->
  <span v-if="visibles.length" class="drapeaux"><Drapeau v-for="l in visibles" :key="l" :langue="l" /></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LANGUE_SOURCE, estLangue } from '../langues/registre.ts'
import Drapeau from '../shell/Drapeau.vue'

/** La fiche est-elle (aussi) dans une langue régionale ? */
function avecRegionale(langues: readonly string[]): boolean {
  return langues.some(l => estLangue(l) && l !== LANGUE_SOURCE)
}

const props = defineProps<{ langues: readonly string[], toujours?: boolean, regionales?: boolean }>()
/** `toujours` : même le français seul (là où la page dit dans quelle langue sont les fiches : le mode bilingue). */
const visibles = computed(() => {
  if (props.regionales) return avecRegionale(props.langues) ? props.langues.filter(estLangue) : []
  return !props.toujours && props.langues.length === 1 && props.langues[0] === LANGUE_SOURCE ? [] : props.langues.filter(estLangue)
})
</script>

<style scoped>
.drapeaux { display: inline-flex; gap: .2rem; align-items: center; }
</style>
