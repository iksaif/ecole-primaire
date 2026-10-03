<template>
  <footer class="pied">
    <RouterLink to="/about">{{ t('apropos') }}</RouterLink>
    <RouterLink to="/mentions-legales">{{ t('mentions') }}</RouterLink>
    <a :href="`mailto:${CONTACT}`">✉️ {{ CONTACT }}</a>
    <a :href="DEPOT" target="_blank" rel="noopener">{{ t('contribuer') }}</a>
    <span>{{ t('libre') }}</span>
  </footer>
</template>

<script setup>
import { useI18n } from '../i18n'
import { CONTACT, DEPOT } from '../site'

const { t } = useI18n({
  fr: { contribuer: '🤝 Contribuer sur GitHub', apropos: 'À propos', mentions: 'Mentions légales', libre: 'Gratuit · sans publicité · sans cookie' },
  br: { contribuer: '🤝 Kemer perzh war GitHub', apropos: 'Diwar-benn', mentions: 'Notennoù lezennel', libre: 'Digoust · hep bruderezh · hep toupin' },
})
</script>

<style scoped>
.pied { display: flex; gap: 1.25rem; justify-content: center; flex-wrap: wrap; padding: 2rem 1rem 2.5rem; font-size: .85rem; color: #888; }
.pied a { color: #777; }
@media print { .pied { display: none; } }
</style>
