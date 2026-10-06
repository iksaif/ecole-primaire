<template>
  <!-- Fil d'Ariane : des liens, puis la page courante (sans lien, aria-current). Un maillon sans `vers` est du texte. -->
  <nav class="fil" :aria-label="t('fichesPretes.fil')">
    <ol>
      <li v-for="(m, i) in maillons" :key="i">
        <RouterLink v-if="m.vers" :to="m.vers">{{ m.texte }}</RouterLink>
        <span v-else :aria-current="i === maillons.length - 1 ? 'page' : undefined" :lang="m.langue">{{ m.texte }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'

export interface Maillon { texte: string, vers?: string, langue?: string }
defineProps<{ maillons: readonly Maillon[] }>()
const { t } = useLangue()
</script>

<style scoped>
.fil { font-size: .88rem; margin-bottom: 1rem; }
ol { list-style: none; display: flex; flex-wrap: wrap; gap: .15rem .4rem; }
li + li::before { content: '›'; margin-right: .4rem; color: var(--texte-doux); }
span { color: var(--texte-doux); }
a { color: var(--bleu-fort); }
</style>
