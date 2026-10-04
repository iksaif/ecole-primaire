<template>
  <div class="container">
    <h1 class="section-heading">{{ langue === 'br' ? '🔢 Matematik' : '🔢 Mathématiques' }}</h1>
    <!-- br: à relire -->
    <p class="vers-programme"><RouterLink :to="{ path: '/programme', query: { domaine: 'nombres-calcul' } }">{{ langue === 'br' ? '📚 Barregezhioù ar programm e matematik →' : '📚 Les compétences du programme en maths →' }}</RouterLink></p>
    <GrilleActivites matiere="maths" par-domaine />
  </div>
</template>

<script setup>
import GrilleActivites from '../components/GrilleActivites.vue'
import { langue } from '../i18n'
</script>

<style scoped>
.vers-programme { margin: -.75rem 0 1.25rem; font-size: .95rem; }
.vers-programme a { color: var(--bleu); font-weight: 700; text-decoration: none; }
</style>
