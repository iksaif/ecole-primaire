<template>
  <!-- ouvre la palette de recherche (src/recherche/) ; Ctrl+K, ⌘K et « / » sont installés par la palette elle-même -->
  <button type="button" class="nbtn" :aria-label="t('shell.barre.rechercher')" aria-haspopup="dialog" :aria-expanded="rechercheOuverte" @click="ouvrirRecherche()">
    <span aria-hidden="true">{{ EMOJI_BARRE.recherche }}</span><span class="etiquette-large">{{ t('shell.barre.rechercher') }}</span>
  </button>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'
import { ouvrirRecherche, rechercheOuverte } from '../recherche/palette.ts'
import { EMOJI_BARRE } from './emojis.ts'

const { t } = useLangue()
</script>

<style scoped>
@media (max-width: 1440px) { .etiquette-large { display: none; } }
</style>
