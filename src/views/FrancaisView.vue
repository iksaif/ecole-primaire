<template>
  <div class="container">
    <h1 class="section-heading">{{ langue === 'br' ? '📝 Galleg' : '📝 Français' }}</h1>
    <p v-if="langue === 'br'" class="note-langue">Ar poelladennoù-mañ a zo evit deskiñ ar galleg : e galleg emañ an danvez.</p>
    <GrilleActivites matiere="francais" par-domaine />
  </div>
</template>

<script setup>
import GrilleActivites from '../components/GrilleActivites.vue'
import { langue } from '../i18n'
</script>

<style scoped>
.note-langue { color: #666; margin: -.5rem 0 1rem; font-style: italic; }
</style>
