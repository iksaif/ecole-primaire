<template>
  <!-- ☰ du téléphone : rubriques, recherche, langue, profil et réglages (le profil enfant n'a pas de menu) -->
  <div ref="racine" class="menu-mobile" @keydown="touche" @focusout="sortie">
    <button ref="bouton" type="button" class="nbtn" :aria-expanded="ouvert" aria-controls="menu-telephone"
      :aria-label="ouvert ? t('shell.barre.fermerMenu') : t('shell.barre.ouvrirMenu')" @click="basculer">
      <span aria-hidden="true">{{ ouvert ? EMOJI_BARRE.fermer : EMOJI_BARRE.menu }}</span>
    </button>
    <div v-if="ouvert" id="menu-telephone" class="panneau-mobile" role="group" :aria-label="t('shell.barre.menuTelephone')">
      <RouterLink to="/" class="grand">{{ t('shell.barre.accueil') }}</RouterLink>
      <button type="button" class="grand" @click="chercher"><span aria-hidden="true">{{ EMOJI_BARRE.recherche }}</span> {{ t('shell.barre.rechercher') }}</button>
      <LienRubrique v-for="r in rubriques" :key="r.id" :rubrique="r" class="grand" />
      <RouterLink to="/programme" class="grand" v-if="!rubriques.some(r => r.id === 'programme')"><span aria-hidden="true">{{ EMOJI_BARRE.programme }}</span> {{ t('shell.rubriques.programme') }}</RouterLink>
      <RouterLink to="/telechargements" class="grand"><span aria-hidden="true">{{ EMOJI_BARRE.fichesPretes }}</span> {{ t('shell.barre.fichesPretes') }}</RouterLink>
      <template v-if="options.length > 1">
        <h3>{{ t('shell.langue.titre') }}</h3>
        <OptionsLangue @choisi="fermer(true)" />
      </template>
      <h3>{{ t('shell.profil.titre') }}</h3>
      <OptionsProfil />
      <RouterLink to="/parametres" class="grand"><span aria-hidden="true">{{ EMOJI_BARRE.reglages }}</span> {{ t('shell.barre.reglages') }}</RouterLink>
      <RouterLink v-if="AVEC_DEV" to="/dev" class="grand"><span aria-hidden="true">{{ EMOJI_BARRE.dev }}</span> {{ t('shell.barre.dev') }}</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'
import { ouvrirRecherche } from '../recherche/palette.ts'
import LienRubrique from './LienRubrique.vue'
import OptionsLangue from './OptionsLangue.vue'
import OptionsProfil from './OptionsProfil.vue'
import { EMOJI_BARRE } from './emojis.ts'
import { useMenu } from './menus.ts'
import type { Rubrique } from './rubriques.ts'
import { useModesLangue } from './useModesLangue.ts'

defineProps<{ rubriques: readonly Rubrique[] }>()
const AVEC_DEV = import.meta.env.DEV || !!import.meta.env.VITE_AVEC_DEV
const { t } = useLangue()
const { options } = useModesLangue()
const { racine, bouton, ouvert, fermer, basculer, touche, sortie } = useMenu('menu')
const chercher = (): void => { fermer(); ouvrirRecherche() }
</script>

<style scoped>
.menu-mobile { display: none; }
.panneau-mobile {
  position: absolute; left: 0; right: 0; top: 100%; z-index: 40; background: white; box-shadow: 0 12px 24px rgba(0,0,0,.2);
  border-top: 1px solid var(--gris-brd); padding: .75rem 16px 1rem; max-height: 80vh; overflow: auto;
}
.grand {
  display: flex; align-items: center; gap: .6rem; width: 100%; min-height: 48px; padding: .5rem; font: inherit; font-size: 1.05rem; font-weight: 800;
  text-align: left; text-decoration: none; color: var(--texte); background: none; border: none; border-bottom: 1px solid var(--gris-bg); cursor: pointer;
}
.grand.router-link-active { color: var(--bleu-fort); }
h3 { font-size: .75rem; text-transform: uppercase; letter-spacing: .05em; color: var(--texte-doux); margin: .8rem 0 .3rem; }
@media (max-width: 640px) { .menu-mobile { display: block; } }
</style>
