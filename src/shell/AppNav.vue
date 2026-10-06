<template>
  <!-- barre de navigation : logo · rubriques · recherche · langue · classe · profil · réglages. Le profil enfant n'a que le logo,
       la classe (verrouillée) et le profil ; au téléphone (≤ 640 px) : logo, recherche, classe, ☰ (le menu porte le reste). -->
  <header class="nav" :class="{ enfant, regional: modeRegionalSeul }">
    <RouterLink to="/" class="logo" :aria-label="t('shell.logoTitre', { nom: SITE.nom })">{{ SITE.emoji }} {{ SITE.nom }}</RouterLink>
    <nav v-if="!enfant" class="rubriques" :aria-label="t('shell.barre.rubriques')">
      <ul class="nav-links">
        <li v-for="r in liens" :key="r.id"><LienRubrique :rubrique="r" /></li>
        <!-- entrée de développement : l'emoji seul (le nom est dans l'étiquette) pour ne pas allonger la barre -->
        <li v-if="AVEC_DEV"><RouterLink to="/dev" :class="{ 'router-link-active': route.path.startsWith('/dev') }" :aria-label="t('shell.barre.dev')" :title="t('shell.barre.dev')">{{ EMOJI_BARRE.dev }}</RouterLink></li>
      </ul>
    </nav>
    <div class="nav-droite">
      <button v-if="modeRegionalSeul" type="button" class="nbtn retour" lang="fr" @click="choisirMode('fr')">
        <span class="sr-only">{{ tf('shell.langue.retour') }}</span>
        <span aria-hidden="true">←</span> <Drapeau langue="fr" aria-hidden="true" /><span class="retour-long" aria-hidden="true">{{ tf('shell.langue.retour') }}</span><span class="retour-court" aria-hidden="true">{{ tf('shell.langue.retourCourt') }}</span>
      </button>
      <BoutonRecherche v-if="!enfant" class="cache-regional" />
      <SelecteurLangue v-if="!enfant" class="grand-ecran" />
      <SelecteurClasse />
      <PastilleProfil :class="{ 'grand-ecran': !enfant }" />
      <RouterLink v-if="!enfant" to="/parametres" class="nbtn grand-ecran" :aria-label="t('shell.barre.reglages')" :title="t('shell.barre.reglages')">{{ EMOJI_BARRE.reglages }}</RouterLink>
      <MenuMobile v-if="!enfant" :rubriques="liens" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useContexte } from '../contexte/useContexte.ts'
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { contenu } from '../langues/traduire.ts'
import { useLangue } from '../langues/useLangue.ts'
import { SITE } from '../sites.ts'
import './barre.css'
import BoutonRecherche from './BoutonRecherche.vue'
import Drapeau from './Drapeau.vue'
import LienRubrique from './LienRubrique.vue'
import MenuMobile from './MenuMobile.vue'
import PastilleProfil from './PastilleProfil.vue'
import SelecteurClasse from './SelecteurClasse.vue'
import SelecteurLangue from './SelecteurLangue.vue'
import { EMOJI_BARRE } from './emojis.ts'
import { menuOuvert } from './menus.ts'
import { rubriques } from './rubriques.ts'

// pages et entrées de développement : absentes d'un build de production (expression écrite telle quelle pour que Vite la replie)
const AVEC_DEV = import.meta.env.DEV || !!import.meta.env.VITE_AVEC_DEV
const route = useRoute()
const { t } = useLangue()
const { contexte, modeRegionalSeul, choisirMode } = useContexte()
// « Retour en français » reste en français : c'est la sortie de l'immersion, il doit se lire sans savoir la langue régionale
const tf = contenu(LANGUE_SOURCE).t
const enfant = computed(() => contexte.value.profil === 'enfant')
const liens = computed(() => rubriques(contexte.value.regionale, contexte.value.profil))
// changer de page referme les menus (un changement de contexte, lui, garde la page : le menu des classes reste ouvert)
watch(() => route.path, () => { menuOuvert.value = null })
</script>

<style scoped>
.nav {
  position: sticky; top: 0; z-index: 30; background: white; box-shadow: var(--shadow); padding: .5rem 1.25rem;
  display: flex; align-items: center; gap: .4rem 1rem;
}
.logo { font-size: 1.4rem; font-weight: 800; text-decoration: none; color: var(--bleu-fort); white-space: nowrap; }
.nav-links { display: flex; gap: .3rem; list-style: none; }
.nav-links :deep(a) {
  display: inline-block; text-decoration: none; padding: .35rem .8rem; border-radius: 20px; font-weight: 700; font-size: .92rem;
  white-space: nowrap; line-height: 1.15; color: var(--texte);
}
.nav-links :deep(a:hover) { background: var(--gris-bg); }
.nav-links :deep(a.router-link-active) { background: var(--bleu-fort); color: white; }
.nav-droite { margin-left: auto; display: flex; align-items: center; gap: .4rem; min-width: 0; }
.retour-court { display: none; }

/* un peu moins large avant que la barre ne passe sur deux lignes */
@media (max-width: 1440px) { .nav-links :deep(a) { padding: .35rem .6rem; } .nav { padding-inline: 1rem; gap: .4rem .7rem; } }
/* écrans moyens : les rubriques passent sur une seconde ligne */
@media (max-width: 1240px) {
  .nav { flex-wrap: wrap; padding: .5rem 1rem; }
  .rubriques { order: 3; flex-basis: 100%; overflow-x: auto; scrollbar-width: none; }
  .rubriques::-webkit-scrollbar { display: none; }
}
/* téléphone : logo, recherche, classe, ☰ ; rien ne déborde à 320 px */
@media (max-width: 640px) {
  .nav { padding: .4rem 16px; gap: .25rem; flex-wrap: nowrap; }
  .logo { font-size: 1.05rem; flex: 1 1 auto; min-width: 0; padding: 2px; display: inline-flex; align-items: center; min-height: 44px; }
  .rubriques, .grand-ecran { display: none; }
  .nav-droite { gap: .25rem; flex: 0 0 auto; }
  .retour-long { display: none; }
  .retour-court { display: inline; }
  /* immersion : le « Retour en français » prend la place de la recherche (qui reste dans le ☰) */
  .regional .cache-regional { display: none; }
}
/* étroit : le nom passe sur deux lignes plutôt que d'être coupé */
@media (max-width: 400px) { .logo { font-size: .95rem; white-space: normal; line-height: 1.1; } }
@media print { .nav { display: none; } }
</style>
