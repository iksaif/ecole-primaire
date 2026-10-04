<template>
  <div class="container">
    <h1 class="section-heading">🌱 {{ t('titre') }}</h1>
    <!-- les exercices de maternelle du catalogue (activites.js), avec leurs classes -->
    <div class="card-grid">
      <RouterLink v-for="a in activites" :key="a.to" :to="a.to" class="card maternelle">
        <span class="card-icon">{{ a.icon }}</span>
        <span class="card-title">{{ langue === 'br' && a.br ? a.br.titre : a.titre }}</span>
        <span class="card-desc">{{ langue === 'br' && a.br ? a.br.desc : a.desc }}</span>
        <span class="card-tag">{{ etiquetteNiveaux(a.niveaux) }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '../../i18n'
import { ACTIVITES, etiquetteNiveaux } from '../../data/activites'
import messagesFr from '../../i18n/fr/views/maternelle/MaternelleView.js'
import messagesBr from '../../i18n/br/views/maternelle/MaternelleView.js'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })
const activites = ACTIVITES.filter(a => a.to.startsWith('/maternelle/'))
</script>

<style>
.card.maternelle { border-color: var(--rose); }
</style>
