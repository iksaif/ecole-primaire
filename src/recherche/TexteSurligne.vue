<template>
  <!-- Le texte d'un résultat, le mot cherché dans <mark> : le texte reste lisible en entier (aucun HTML injecté). -->
  <span><template v-for="(m, i) in morceaux" :key="i"><mark v-if="m.trouve">{{ m.texte }}</mark><template v-else>{{ m.texte }}</template></template></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { decouper } from './surlignage.ts'

const props = defineProps<{ texte: string, requete: string }>()
const morceaux = computed(() => decouper(props.texte, props.requete))
</script>

<style scoped>
mark { background: #ffe58a; color: var(--texte); border-radius: 3px; padding: 0 1px; }
</style>
