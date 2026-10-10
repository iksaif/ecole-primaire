<template>
  <GrammaireExercice :definition="definition" :contenu="CONTENU" section="grammaireMots" />
</template>

<script setup lang="ts">
// Une vue mince : tout est dans GrammaireExercice.vue (le même composant pour les cinq exercices de grammaire).
import definition from '../../exercices/grammaire-mots/definition.ts'
import { CONTENU } from '../../exercices/grammaire-mots/textes.ts'
import GrammaireExercice from './GrammaireExercice.vue'
</script>
