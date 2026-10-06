<template>
  <ul class="badges">
    <li v-if="badges.jeu" class="badge jeu"><span aria-hidden="true">{{ EMOJI_BADGE.jeu }}</span> {{ t('ressource.enLigne') }}</li>
    <li v-if="badges.imprimable" class="badge imprimable"><span aria-hidden="true">{{ EMOJI_BADGE.imprimable }}</span> {{ t('ressource.imprimable') }}</li>
  </ul>
</template>

<script setup lang="ts">
// Ce qu'on peut faire d'une ressource : la jouer en ligne, l'imprimer. Les deux badges sont sur la même carte.
import { useLangue } from '../../langues/useLangue.ts'
import type { Badges } from '../types.ts'
import { EMOJI_BADGE } from './presentation.ts'

defineProps<{ badges: Badges }>()
const { t } = useLangue()
</script>

<style scoped>
.badges { list-style: none; display: flex; flex-wrap: wrap; gap: .3rem; justify-content: inherit; }
.badge { font-size: .75rem; font-weight: 700; padding: .1rem .5rem; border-radius: 999px; white-space: nowrap; }
.jeu { background: #e8f5e9; color: #1b5e20; }
.imprimable { background: #fff3e0; color: #7a4300; }
</style>
