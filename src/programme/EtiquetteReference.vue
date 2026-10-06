<template>
  <!-- un lien à part, jamais dans le lien de la compétence : il ouvre le texte officiel (PDF) à la bonne page -->
  <a class="reference" :href="reference.url" target="_blank" rel="noopener noreferrer">
    {{ etiquette }}<span class="sr-only"> ({{ t('programme.reference.ouvre') }})</span>
  </a>
</template>

<script setup lang="ts">
// Étiquette « BO 41 · p. PDF 26 » : la page est celle du PDF (convention de src/data/programme.ts), pas la page imprimée.
import { computed } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { etiquetteDeReference } from './references.ts'
import type { Reference } from './references.ts'

const props = defineProps<{ reference: Reference }>()
const { t, langueAffichee } = useLangue()
const etiquette = computed(() => etiquetteDeReference(langueAffichee.value, props.reference))
</script>

<style scoped>
.reference { color: var(--bleu-fort); font-weight: 700; font-size: .78rem; line-height: 1.2; text-decoration: underline; display: inline-block; padding: .15rem 0; }
</style>
