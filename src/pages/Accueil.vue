<template>
  <div class="container" data-page="accueil">
    <AccueilEnfant v-if="contexte.profil === 'enfant'" />
    <AccueilAdulte v-else />
    <AccueilProfil />
  </div>
</template>

<script setup lang="ts">
// Page d'accueil : trois dispositions selon le profil (enfant, parent, enseignant), le choix du profil en bas (facultatif).
// On arrive toujours sur du contenu ; seule la toute première visite ouvre la visite guidée par-dessus (passable à tout moment).
import { useContexte } from '../contexte/useContexte.ts'
import AccueilAdulte from './AccueilAdulte.vue'
import AccueilEnfant from './AccueilEnfant.vue'
import AccueilProfil from './AccueilProfil.vue'

const { contexte } = useContexte()
</script>
