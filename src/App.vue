<template>
  <a :href="`#${ID_CONTENU}`" class="lien-evitement" @click.prevent="focaliserContenu">{{ t('routeur.evitement') }}</a>
  <AppNav />
  <main :id="ID_CONTENU" tabindex="-1">
    <RouterView />
  </main>
  <AppFooter />
</template>

<script setup lang="ts">
import AppNav from './shell/AppNav.vue'
import AppFooter from './shell/AppFooter.vue'
import { useLangue } from './langues/useLangue.ts'
import { ID_CONTENU, focaliserContenu } from './router/focus.ts'

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
@media print { .lien-evitement { display: none; } }
</style>
