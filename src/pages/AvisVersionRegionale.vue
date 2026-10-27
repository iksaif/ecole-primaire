<template>
  <!-- Sur le site régional (skoolik) : ce que c'est (la version franco-bretonne d'ecoleprimaire.app), qu'elle est en construction, et comment aider pour les traductions.
       Rien sur le site de référence. -->
  <aside v-if="SITE.referenceFrancais !== null" class="avis" aria-labelledby="avis-region" data-avis-regional>
    <h2 id="avis-region">{{ t('accueil.versionRegionale.titre', { nom: SITE.nom, reference }) }}</h2>
    <p>{{ t('accueil.versionRegionale.texte', { nom: SITE.nom, reference }) }}</p>
    <p>{{ t('accueil.versionRegionale.aide') }}</p>
    <p><a class="contact" :href="lien">{{ SITE.contact }}</a></p>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { SITE } from '../sites.ts'

const { t } = useLangue()
/** Le site de référence, sans « https:// » ni barre finale : « ecoleprimaire.app » */
const reference = SITE.referenceFrancais ? new URL(SITE.referenceFrancais).host : ''
const lien = computed(() => `mailto:${SITE.contact}?subject=${encodeURIComponent(t('accueil.versionRegionale.sujet'))}`)
</script>

<style scoped>
.avis { max-width: 46rem; margin: 1rem 0; padding: .8rem 1rem; border-left: 4px solid var(--bleu-fort, #2f70c0); background: var(--gris-bg, #f2f5f9); border-radius: 0 10px 10px 0; }
.avis h2 { font-size: 1.05rem; margin: 0 0 .35rem; }
.avis p { margin: .25rem 0; line-height: 1.5; }
.avis .contact { display: inline-block; min-height: 44px; line-height: 44px; font-weight: 700; }
@media print { .avis { display: none; } }
</style>
