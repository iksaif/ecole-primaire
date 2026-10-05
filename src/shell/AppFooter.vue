<template>
  <footer class="pied">
    <RouterLink to="/nouveautes">{{ t('pied.nouveautes') }}</RouterLink>
    <RouterLink to="/about">{{ t('pied.apropos') }}</RouterLink>
    <a :href="`mailto:${SITE.contact}`">✉️ {{ SITE.contact }}</a>
    <a :href="SITE.depot" target="_blank" rel="noopener">{{ t('pied.contribuer') }}</a>
    <span>{{ t('pied.libre') }}</span>
  </footer>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'
import { SITE } from '../sites.ts'

const { t } = useLangue()
</script>

<style scoped>
.pied { display: flex; gap: 1.25rem; justify-content: center; flex-wrap: wrap; padding: 2rem 1rem 2.5rem; font-size: .85rem; color: #888; }
.pied a { color: #777; }
@media print { .pied { display: none; } }
</style>
