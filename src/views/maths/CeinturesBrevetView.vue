<template>
  <div class="container">
    <h1 class="section-heading"><Icone v-if="DEFINITION.emoji" :nom="DEFINITION.emoji" /> {{ t('ceinturesBrevet.titre') }}</h1>
    <p class="intro">{{ t('ceinturesBrevet.intro') }}</p>
    <BrevetPapier />
  </div>
</template>

<script setup lang="ts">
// Les brevets de ceintures : une activité de fiches (pas de partie à l'écran). Le formulaire et l'aperçu sont dans src/ceintures/BrevetPapier.vue (aussi l'onglet « Ceintures » d'un exercice).
import Icone from '../../images/Icone.vue'
import { useLangue } from '../../langues/useLangue.ts'
import BrevetPapier from '../../ceintures/BrevetPapier.vue'
import DEFINITION from '../../exercices/ceintures-brevet/definition.ts'

const { t } = useLangue()
</script>

<style scoped>
.intro { color: var(--texte-doux); margin: 0 0 1rem; max-width: 60rem; }
</style>
