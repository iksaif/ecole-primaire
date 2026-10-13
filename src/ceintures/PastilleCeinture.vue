<!--
  Une petite ceinture dans la couleur du numéro (réglages communs : palette, dessin, noir et blanc), à côté d'un numéro de ceinture dans un choix.
  `indice` : 0 pour la première ceinture de la palette ; sans couleur à cet indice (palette plus courte), rien n'est dessiné. Décoratif : le numéro dit le choix.
-->
<template>
  <span v-if="svg" class="pastille-ceinture" aria-hidden="true" v-html="svg" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ceintureSvg } from './dessin.ts'
import { PALETTES } from './palettes.ts'
import { useCeintures } from './useCeintures.ts'

const props = defineProps<{ indice: number }>()
const reglages = useCeintures()
const svg = computed(() => {
  const couleur = PALETTES[reglages.value.palette].couleurs[props.indice]
  return couleur ? ceintureSvg({ couleur, style: reglages.value.style, noirEtBlanc: reglages.value.noirEtBlanc, largeur: '2.2rem' }) : ''
})
</script>

<style scoped>
.pastille-ceinture { display: inline-flex; vertical-align: middle; margin: 0 .15rem; }
</style>
