<template>
  <div class="container">
    <h1 class="section-heading">{{ langue === 'br' ? '🔢 Matematik' : '🔢 Mathématiques' }}</h1>
    <GrilleActivites matiere="maths" par-domaine />
  </div>
</template>

<script setup>
import GrilleActivites from '../components/GrilleActivites.vue'
import { langue } from '../i18n'
</script>
