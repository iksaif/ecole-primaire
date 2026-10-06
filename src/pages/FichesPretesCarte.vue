<template>
  <!-- Une fiche en carte : miniature, titre (le seul lien : son zone cliquable couvre toute la carte), classes en pastilles, langues,
       usage, nombre de pages. La miniature est décorative (le titre la décrit). -->
  <article class="carte" :class="{ compacte }">
    <div class="mini">
      <img :src="urlFiches(entree.miniature.chemin)" :width="entree.miniature.largeur" :height="entree.miniature.hauteur" alt="" loading="lazy">
    </div>
    <div class="infos">
      <component :is="`h${niveauTitre}`" class="titre">
        <RouterLink class="lien" :to="`/telechargements/${entree.slug}`" :lang="langueDuTexte(entree.titre, langueAffichee)">{{ texteDe(entree.titre, langueAffichee) }}</RouterLink>
      </component>
      <PastillesClasses :classes="entree.niveaux" :choisies="selection" />
      <p class="badges">
        <FichesPretesLangues :langues="entree.langues" :toujours="avecLangues" />
        <span class="badge">{{ t(entree.usage === 'apprendre' ? 'fichesPretes.apprendre' : 'fichesPretes.sentrainer') }}</span>
        <span v-if="entree.exemple" class="badge exemple">{{ t('fichesPretes.badgeExemple') }}</span>
      </p>
      <p class="meta">{{ t('fichesPretes.pdfPages', { n: entree.nbPages }) }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'
import { urlFiches } from '../telechargements/chargement.ts'
import { langueDuTexte, texteDe } from '../telechargements/recherche.ts'
import type { Classe, EntreeIndex } from '../telechargements/types.ts'
import PastillesClasses from '../ressources/composants/PastillesClasses.vue'
import FichesPretesLangues from './FichesPretesLangues.vue'

withDefaults(defineProps<{
  entree: EntreeIndex
  /** classes choisies (mises en valeur parmi celles de la fiche) */
  selection?: readonly Classe[]
  /** montrer les langues même pour une fiche en français (mode bilingue) */
  avecLangues?: boolean
  compacte?: boolean
  /** niveau du titre (2 sous le titre de la page, 4 sous un titre de sous-section) */
  niveauTitre?: 2 | 3 | 4
}>(), { selection: () => [], niveauTitre: 2 })
const { t, langueAffichee } = useLangue()
</script>

<style scoped>
.carte { position: relative; display: flex; flex-direction: column; background: white; border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.carte:hover, .carte:focus-within { box-shadow: 0 6px 18px rgba(0, 0, 0, .18); }
.mini { background: #eef1f5; display: flex; justify-content: center; align-items: center; height: 180px; padding: .6rem .6rem 0; overflow: hidden; }
.compacte .mini { height: 120px; }
.mini img { max-width: 100%; max-height: 100%; width: auto; height: auto; box-shadow: 0 2px 8px rgba(0, 0, 0, .2); background: white; }
.infos { display: flex; flex-direction: column; gap: .35rem; padding: .7rem .8rem .8rem; }
.titre { font-size: 1rem; font-weight: 800; line-height: 1.25; }
.compacte .titre { font-size: .88rem; }
.lien { color: var(--texte); text-decoration: none; }
.lien::after { content: ''; position: absolute; inset: 0; }
.lien:hover { text-decoration: underline; }
.badges { display: flex; flex-wrap: wrap; gap: .3rem; align-items: center; }
.badge { font-size: .78rem; background: var(--gris-bg); border-radius: 20px; padding: .1rem .55rem; color: var(--texte); }
.badge.exemple { background: var(--jaune); }
.meta { font-size: .82rem; color: var(--texte-doux); }
</style>
