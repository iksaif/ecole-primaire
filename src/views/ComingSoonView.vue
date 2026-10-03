<template>
  <div class="container">
    <div class="coming-soon">
      <div class="icon">🚧</div>
      <p>{{ t('bientot') }}</p>
      <RouterLink to="/" class="btn btn-ghost" style="margin-top:1rem;">← {{ t('retour') }}</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '../i18n'

const { t } = useI18n({
  fr: { bientot: 'Cet exercice arrive bientôt !', retour: "Retour à l'accueil" },
  br: { bientot: 'Emañ ar boelladenn-mañ o tont a-benn nebeut !', retour: "Distreiñ d'ar bajenn degemer" }, // br: à relire
})
</script>
