<template>
  <GrammaireExercice :definition="definition" :contenu="CONTENU" section="grammaireComplements" />
</template>

<script setup lang="ts">
// Une vue mince : tout est dans GrammaireExercice.vue (le même composant pour les cinq exercices de grammaire).
import definition from '../../exercices/grammaire-complements/definition.ts'
import { CONTENU } from '../../exercices/grammaire-complements/textes.ts'
import GrammaireExercice from './GrammaireExercice.vue'
</script>
