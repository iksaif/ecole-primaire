<template>
  <span v-if="routes" class="pastille-dev" :class="{ migre: routes.has(route) }">{{ routes.has(route) ? 'migré' : 'à migrer' }}</span>
</template>

<script setup>
// Mode dev seulement (chargé par import dynamique sous import.meta.env.DEV, absent du build) :
// l'exercice est-il passé au modèle src/exercices/ (plan 10) ?
import { ref } from 'vue'
defineProps({ route: { type: String, required: true } })
const routes = ref(null)
import('../exercices/index.js').then(m => { routes.value = new Set(m.REGISTRE.map(e => e.definition.route)) })
</script>

<style scoped>
.pastille-dev { position: absolute; top: .4rem; right: .4rem; font-size: .65rem; font-weight: 700; padding: .1rem .4rem;
  border-radius: 999px; background: #fde2e1; color: #a61b1b; }
.pastille-dev.migre { background: #d3f9d8; color: #1b7a2e; }
</style>
