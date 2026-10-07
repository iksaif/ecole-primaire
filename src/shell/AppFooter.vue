<template>
  <footer class="pied">
    <nav :aria-label="t('shell.pied.navigation')">
      <ul>
        <li><RouterLink to="/programme"><span aria-hidden="true">{{ EMOJI_BARRE.programme }}</span> {{ t('shell.pied.programme') }}</RouterLink></li>
        <li><RouterLink to="/telechargements"><span aria-hidden="true">{{ EMOJI_BARRE.fichesPretes }}</span> {{ t('shell.pied.fichesPretes') }}</RouterLink></li>
        <li><RouterLink to="/nouveautes"><span aria-hidden="true">{{ EMOJI_PIED.nouveautes }}</span> {{ t('shell.pied.nouveautes') }}</RouterLink></li>
        <li><RouterLink to="/about"><span aria-hidden="true">{{ EMOJI_PIED.apropos }}</span> {{ t('shell.pied.apropos') }}</RouterLink></li>
        <li><a :href="`${SITE.depot}/issues/new`" target="_blank" rel="noopener"><span aria-hidden="true">{{ EMOJI_PIED.signaler }}</span> {{ t('shell.pied.signaler') }}</a></li>
        <li><a :href="SITE.depot" target="_blank" rel="noopener"><span aria-hidden="true">{{ EMOJI_PIED.depot }}</span> {{ t('shell.pied.depot') }}</a></li>
        <li><a :href="`mailto:${SITE.contact}`"><span aria-hidden="true">{{ EMOJI_PIED.contact }}</span> {{ t('shell.pied.contact') }}</a></li>
        <li><RouterLink to="/mentions-legales"><span aria-hidden="true">{{ EMOJI_PIED.mentions }}</span> {{ t('shell.pied.mentions') }}</RouterLink></li>
      </ul>
    </nav>
    <p>{{ t('shell.pied.libre') }}</p>
  </footer>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'
import { SITE } from '../sites.ts'
import { EMOJI_BARRE, EMOJI_PIED } from './emojis.ts'

const { t } = useLangue()
</script>

<style scoped>
/* texte --texte-doux (5,3:1 sur blanc, 5,1:1 sur --gris-bg) : les anciens gris #888 / #777 n'atteignaient pas 4,5:1 */
.pied { padding: 2rem 1rem 2.5rem; font-size: .88rem; color: var(--texte-doux); text-align: center; }
.pied ul { display: flex; gap: .4rem; justify-content: center; flex-wrap: wrap; list-style: none; margin-bottom: .75rem; }
.pied a { display: inline-flex; align-items: center; gap: .35rem; min-height: 44px; padding: .3rem .85rem; border-radius: 999px; background: white; box-shadow: var(--shadow); color: var(--texte); font-weight: 600; text-decoration: none; }
.pied a:hover { color: var(--bleu-fort); text-decoration: underline; }
@media print { .pied { display: none; } }
</style>
