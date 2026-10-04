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
import messagesFr from '../i18n/fr/views/ComingSoonView.js'
import messagesBr from '../i18n/br/views/ComingSoonView.js'

const { t } = useI18n({ fr: messagesFr, br: messagesBr })
</script>
