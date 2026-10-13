<template>
  <GeometrieExercice :definition="definition" section="solides" />
</template>

<script setup lang="ts">
// Une vue mince : tout est dans GeometrieExercice.vue (le même composant pour les exercices de géométrie).
import definition from '../../exercices/solides/definition.ts'
import GeometrieExercice from './GeometrieExercice.vue'
</script>
