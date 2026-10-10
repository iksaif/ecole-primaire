<template>
  <GrammaireExercice :definition="definition" :contenu="CONTENU" section="grammaireAccords" />
</template>

<script setup lang="ts">
// Une vue mince : tout est dans GrammaireExercice.vue (le même composant pour les cinq exercices de grammaire).
import definition from '../../exercices/grammaire-accords/definition.ts'
import { CONTENU } from '../../exercices/grammaire-accords/textes.ts'
import GrammaireExercice from './GrammaireExercice.vue'
</script>
