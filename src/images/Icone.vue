<!--
  Une icône d'interface (Phosphor, src/images/icones.ts), de la couleur du texte. Décorative quand un texte l'accompagne ; seule dans un
  bouton, elle reçoit `libelle` (lu par les lecteurs d'écran). `taille` : unité CSS, 1.25em par défaut (elle suit le texte et le mode
  enfant). `pleine` : la version pleine, pour un état actif ou sélectionné.
    <button><Icone nom="imprimer" /> Imprimer</button>   <button><Icone nom="fermer" libelle="Fermer" /></button>
-->
<template>
  <span class="icone-phosphor" v-html="html" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NomIcone } from './icones.ts'
import { iconeHtml } from './icone.ts'

const props = defineProps<{ nom: NomIcone, taille?: string, libelle?: string, pleine?: boolean }>()

// le rendu ne produit que des dessins de la table et des attributs échappés : v-html est sûr ici
const html = computed(() => iconeHtml(props.nom, { taille: props.taille, libelle: props.libelle, pleine: props.pleine }))
</script>

<style scoped>
/* alignée sur le texte : centrée sur la hauteur des minuscules, sans ligne de plus */
.icone-phosphor { display: inline-flex; vertical-align: -0.25em; line-height: 1; flex: none; }
</style>
