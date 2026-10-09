<template>
  <a :href="`#${ID_CONTENU}`" class="lien-evitement" @click.prevent="focaliserContenu">{{ t('routeur.evitement') }}</a>
  <!-- pendant une partie en ligne (immersion : src/noyau/immersion.ts), la barre et le pied de page s'effacent -->
  <AppNav v-if="!immersion" />
  <!-- confirmation de l'adresse spéciale qui active ou désactive le mode enseignant (idée en construction) -->
  <BandeauEnseignant />
  <!-- avis de traduction automatique (modale, une fois par langue) ; palette de recherche (Ctrl+K, ⌘K, « / » ou le 🔍 de la barre) -->
  <AvisTraduction />
  <Recherche />
  <main :id="ID_CONTENU" tabindex="-1" :class="{ immersion }">
    <RouterView />
  </main>
  <AppFooter v-if="!immersion" />
</template>

<script setup lang="ts">
import AppNav from './shell/AppNav.vue'
import AppFooter from './shell/AppFooter.vue'
import BandeauEnseignant from './shell/BandeauEnseignant.vue'
import AvisTraduction from './shell/AvisTraduction.vue'
import Recherche from './recherche/Recherche.vue'
import { useLangue } from './langues/useLangue.ts'
import { ID_CONTENU, focaliserContenu } from './router/focus.ts'
import { immersion } from './noyau/immersion.ts'

const { t } = useLangue()
</script>

<style scoped>
/* lien d'évitement : caché hors focus, premier élément atteint au clavier */
.lien-evitement {
  position: absolute; left: .5rem; top: -4rem; z-index: 100; background: white; color: var(--texte);
  padding: .5rem .9rem; border-radius: 8px; box-shadow: var(--shadow); font-weight: 700; text-decoration: none;
}
.lien-evitement:focus { top: .5rem; outline: 3px solid var(--bleu); }
/* le focus programmatique à chaque page n'est pas un état à montrer */
main:focus { outline: none; }
/* immersion : le titre et le fil d'Ariane de la page s'effacent aussi, la question monte en haut de l'écran */
main.immersion :deep(.section-heading), main.immersion :deep(nav.fil), main.immersion :deep(> .container > h1) { display: none; }
main.immersion { padding-top: .75rem; }
@media print { .lien-evitement { display: none; } }
</style>
