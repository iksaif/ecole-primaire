<template>
  <ul class="pastilles" :aria-label="t('ressource.classes')">
    <li v-for="c in classes" :key="c" class="pastille" :class="{ choisie: choisies.includes(c) }">
      {{ c.toUpperCase() }}<span v-if="choisies.includes(c)" class="sr-only"> {{ t('ressource.classeChoisie') }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
// Les classes d'une ressource en pastilles, celles des classes choisies mises en évidence (couleur ET texte caché pour les lecteurs d'écran).
import { useLangue } from '../../langues/useLangue.ts'
import type { Classe } from '../types.ts'

defineProps<{ classes: readonly Classe[], choisies: readonly Classe[] }>()
const { t } = useLangue()
</script>

<style scoped>
.pastilles { list-style: none; display: flex; flex-wrap: wrap; gap: .25rem; justify-content: inherit; }
.pastille { font-size: .75rem; font-weight: 800; padding: .1rem .5rem; border-radius: 999px; background: #eceff1; color: #455a64; }
.pastille.choisie { background: var(--bleu-fort); color: white; }
</style>
