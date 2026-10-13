<template>
  <GeometrieExercice :definition="definition" section="symetrie" />
</template>

<script setup lang="ts">
// Une vue mince : tout est dans GeometrieExercice.vue (le même composant pour les exercices de géométrie).
import definition from '../../exercices/symetrie/definition.ts'
import GeometrieExercice from './GeometrieExercice.vue'
</script>
