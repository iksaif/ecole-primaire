<template>
  <footer class="pied">
    <SignalerErreur />
    <RouterLink to="/nouveautes">{{ t('nouveautes') }}</RouterLink>
    <RouterLink to="/about">{{ t('apropos') }}</RouterLink>
    <RouterLink to="/mentions-legales">{{ t('mentions') }}</RouterLink>
    <a :href="`mailto:${CONTACT}`">✉️ {{ CONTACT }}</a>
    <a :href="DEPOT" target="_blank" rel="noopener">{{ t('contribuer') }}</a>
    <span>{{ t('libre') }}</span>
  </footer>
</template>

<script setup>
import { useI18n } from '../i18n'
import SignalerErreur from './SignalerErreur.vue'
import messagesFr from '../i18n/fr/components/AppFooter.js'
import messagesBr from '../i18n/br/components/AppFooter.js'
import { CONTACT, DEPOT } from '../site'

const { t } = useI18n({ fr: messagesFr, br: messagesBr })
</script>

<style scoped>
.pied { display: flex; gap: 1.25rem; justify-content: center; flex-wrap: wrap; padding: 2rem 1rem 2.5rem; font-size: .85rem; color: #888; }
.pied a { color: #777; }
@media print { .pied { display: none; } }
</style>
