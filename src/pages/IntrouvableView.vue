<template>
  <div class="container" data-page="introuvable">
    <h1 class="section-heading">{{ t('routeur.titre.introuvable') }}</h1>
    <p>{{ t('routeur.introuvable.message') }}</p>
    <p><RouterLink to="/" class="btn btn-primary">{{ t('routeur.introuvable.accueil') }}</RouterLink></p>
  </div>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'

const { t } = useLangue()
</script>
