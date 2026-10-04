<template>
  <div class="container">
    <h1 class="section-heading">{{ langue === 'br' ? '📝 Galleg' : '📝 Français' }}</h1>
    <!-- br: à relire -->
    <p class="vers-programme"><RouterLink :to="{ path: '/programme', query: { domaine: 'lecture' } }">{{ langue === 'br' ? '📚 Barregezhioù ar programm e galleg →' : '📚 Les compétences du programme en français →' }}</RouterLink></p>
    <p v-if="langue === 'br'" class="note-langue">Ar poelladennoù-mañ a zo evit deskiñ ar galleg : e galleg emañ an danvez.</p>
    <GrilleActivites matiere="francais" par-domaine />
  </div>
</template>

<script setup>
import GrilleActivites from '../components/GrilleActivites.vue'
import { langue } from '../i18n'
</script>

<style scoped>
.vers-programme { margin: -.75rem 0 1.25rem; font-size: .95rem; }
.vers-programme a { color: var(--bleu); font-weight: 700; text-decoration: none; }
.note-langue { color: #666; margin: -.5rem 0 1rem; font-style: italic; }
</style>
