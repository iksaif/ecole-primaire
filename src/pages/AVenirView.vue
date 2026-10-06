<template>
  <div class="container" data-page="a-venir">
    <h1 class="section-heading">{{ titre }}</h1>
    <p class="construction">🚧 {{ t('routeur.avenir') }}</p>
  </div>
</template>

<script setup lang="ts">
// Page provisoire : la route existe (adresse, titre, focus), son contenu sera écrit par le paquet qui la possède (plan 13).
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLangue } from '../langues/useLangue.ts'
import { titreDeLaRoute } from '../router/titres.ts'

const { t, langueAffichee } = useLangue()
const route = useRoute()
const titre = computed(() => titreDeLaRoute(route.meta, langueAffichee.value))
</script>

<style scoped>
.construction { color: #666; margin-top: 1rem; }
</style>
