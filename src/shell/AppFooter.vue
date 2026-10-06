<template>
  <footer class="pied">
    <nav :aria-label="t('shell.pied.navigation')">
      <ul>
        <li><RouterLink to="/programme">{{ t('shell.pied.programme') }}</RouterLink></li>
        <li><RouterLink to="/telechargements">{{ t('shell.pied.fichesPretes') }}</RouterLink></li>
        <li><RouterLink to="/nouveautes">{{ t('shell.pied.nouveautes') }}</RouterLink></li>
        <li><RouterLink to="/about">{{ t('shell.pied.apropos') }}</RouterLink></li>
        <li><a :href="`${SITE.depot}/issues/new`" target="_blank" rel="noopener">{{ t('shell.pied.signaler') }}</a></li>
        <li><a :href="SITE.depot" target="_blank" rel="noopener">{{ t('shell.pied.depot') }}</a></li>
        <li><a :href="`mailto:${SITE.contact}`">{{ t('shell.pied.contact') }}</a></li>
      </ul>
    </nav>
    <p>{{ t('shell.pied.libre') }}</p>
  </footer>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'
import { SITE } from '../sites.ts'

const { t } = useLangue()
</script>

<style scoped>
/* texte --texte-doux (5,3:1 sur blanc, 5,1:1 sur --gris-bg) : les anciens gris #888 / #777 n'atteignaient pas 4,5:1 */
.pied { padding: 2rem 1rem 2.5rem; font-size: .88rem; color: var(--texte-doux); text-align: center; }
.pied ul { display: flex; gap: .25rem 1.25rem; justify-content: center; flex-wrap: wrap; list-style: none; margin-bottom: .75rem; }
.pied a { color: var(--texte-doux); text-decoration: underline; display: inline-block; padding: .35rem 0; }
.pied a:hover { color: var(--texte); }
@media print { .pied { display: none; } }
</style>
