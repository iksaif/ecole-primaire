<template>
  <!-- Une fiche dans la grille : miniature, titre, classes. Tout le bloc est un lien vers la page de la fiche. -->
  <router-link class="carte" :class="entree.usage" :to="`/telechargements/${entree.slug}`">
    <img :src="urlFiches(entree.miniature.chemin)" :width="entree.miniature.largeur" :height="entree.miniature.hauteur" alt="" loading="lazy">
    <span class="titre" :lang="langueDuTexte(entree.titreCourt, langue)">{{ texteDe(entree.titreCourt, langue) }}</span>
    <small class="meta">
      <span>{{ etiquetteClasses(entree.niveaux, NIVEAUX) }}</span>
      <span v-if="entree.nbPages > 1"> · {{ t('telechargements.pages', { n: entree.nbPages }) }}</span>
      <span v-if="entree.nbVariantes > 1"> · {{ t('telechargements.variantes', { n: entree.nbVariantes }) }}</span>
      <em v-if="langues.length" class="badge">{{ langues.join(' · ') }}</em>
      <em v-if="entree.exemple" class="badge exemple">{{ t('telechargements.exemple') }}</em>
    </small>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NIVEAUX } from '../data/classes.ts'
import { useLangue } from '../langues/useLangue.ts'
import { estLangue, nomDeLangue } from '../langues/registre.ts'
import { urlFiches } from './chargement.ts'
import { etiquetteClasses, langueDuTexte, texteDe } from './recherche.ts'
import type { EntreeIndex } from './types.ts'

const props = defineProps<{ entree: EntreeIndex }>()
const { t, langue } = useLangue()
// langue de la fiche, nommée dans la langue de l'interface ; rien pour une fiche en français seul
const langues = computed(() => (props.entree.langues.length === 1 && props.entree.langues[0] === 'fr' ? []
  : props.entree.langues.map(l => (estLangue(l) ? nomDeLangue(l, langue.value) : l))))
</script>

<style scoped>
.carte { position: relative; display: flex; flex-direction: column; gap: .4rem; padding: .6rem; background: white; border-radius: var(--radius);
  box-shadow: var(--shadow); text-decoration: none; color: var(--texte); border-top: 4px solid var(--orange); }
.carte.sentrainer { border-top-color: var(--vert); }
.carte:hover, .carte:focus-visible { box-shadow: 0 6px 18px rgba(0, 0, 0, .18); }
.carte img { width: 100%; height: auto; border: 1px solid var(--gris-brd); }
.titre { font-weight: 700; font-size: .92rem; }
.meta { color: #666; font-size: .78rem; }
.badge { font-style: normal; font-size: .7rem; background: #eee; border-radius: 6px; padding: .05rem .35rem; margin-left: .25rem; }
.badge.exemple { background: var(--jaune); }
</style>
