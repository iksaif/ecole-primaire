<!--
  Une icône d'interface (src/images/icones.ts) : l'emoji de l'appareil (par défaut), ou le dessin OpenMoji du site, selon le réglage
  des icônes (page des réglages, onglet « Appareil » : useIconesInterface). Décorative quand un texte l'accompagne ; seule dans un
  bouton, elle reçoit `libelle` (lu par les lecteurs d'écran). `taille` : unité CSS ; par défaut elle suit le texte (et le mode enfant).
    <button><Icone nom="imprimer" /> Imprimer</button>   <button><Icone nom="fermer" libelle="Fermer" /></button>
-->
<template>
  <span class="icone-interface" v-html="html" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NomIcone } from './icones.ts'
import { iconeHtml } from './icone.ts'
import { dessinsInterfacePrets, useIconesInterface } from './useImagesFiche.ts'

const props = defineProps<{ nom: NomIcone, taille?: string, libelle?: string }>()
const famille = useIconesInterface()

// le rendu ne produit que des dessins de la table et des attributs échappés : v-html est sûr ici
const html = computed(() => {
  // lu pour que l'icône se redessine quand les dessins du site arrivent (ils sont chargés à la demande)
  void dessinsInterfacePrets.value
  return iconeHtml(props.nom, { taille: props.taille, libelle: props.libelle, famille: famille.value })
})
</script>

<style scoped>
/* alignée sur le texte : centrée sur la hauteur des minuscules, sans ligne de plus */
.icone-interface { display: inline-flex; vertical-align: -0.25em; line-height: 1; flex: none; }
</style>
