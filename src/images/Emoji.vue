<!--
  Un emoji de la table (src/images/tables.ts) à l'écran, dans la famille choisie (useImagesFiche), toujours en couleur.
  `taille` : n'importe quelle unité CSS ; par défaut il suit le texte (1em, donc aussi le mode enfant). `alt` : le mot visé, lu par
  les lecteurs d'écran ; sans `alt`, l'image est décorative (le mot est écrit à côté). `famille` et `trait` (le style : `style` est
  réservé par Vue) imposent un rendu au lieu de la préférence (l'aperçu de chaque choix dans ChoixImages).
    <Emoji nom="pomme" />   <Emoji nom="chat" taille="3rem" alt="un chat" />   <Emoji nom="pomme" trait="contour" />
-->
<template>
  <span class="emoji" v-html="html" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NomEmoji } from './tables.ts'
import type { FamilleImages, StyleImages } from './preference.ts'
import { creerRenduImages } from './rendu.ts'
import { useImagesFiche } from './useImagesFiche.ts'

const props = defineProps<{ nom: NomEmoji, taille?: string, alt?: string, famille?: FamilleImages, trait?: StyleImages }>()

const preference = useImagesFiche()
// à l'écran : la famille choisie, toujours en couleur (le contour est fait pour le papier), sauf rendu imposé
const rendu = computed(() => creerRenduImages({ famille: props.famille ?? preference.value.famille, style: props.trait ?? 'couleur' }))
// le rendu ne produit que des dessins de la table et des attributs échappés : v-html est sûr ici
const html = computed(() => rendu.value.html(props.nom, props.taille, props.alt))
</script>

<style scoped>
.emoji { display: inline-flex; vertical-align: -0.125em; line-height: 1; }
</style>
