<template>
  <!-- Fiches voisines : d'abord celles de la même compétence, puis celles du même domaine (la classe n'entre pas en compte : on y trouve
       aussi la même fiche pour d'autres classes). Les voisines viennent du catalogue, qui se charge après la fiche. -->
  <section class="boite" :aria-labelledby="idTitre">
    <h2 :id="idTitre" class="sr-only">{{ t('feuille.voisines') }}</h2>
    <p v-if="!feuille.voisinesPretes" class="vide" role="status">{{ t('feuille.chargementVoisines') }}</p>
    <template v-else>
      <h3>{{ t('feuille.memeCompetence') }}</h3>
      <ul v-if="feuille.voisinesCompetence.length" class="grille"><li v-for="e in feuille.voisinesCompetence" :key="e.slug"><FichesPretesCarte :entree="e" compacte :niveau-titre="4" /></li></ul>
      <p v-else class="vide">{{ t('feuille.aucuneCompetence') }}</p>
      <h3>{{ t('feuille.memeDomaine', { domaine: nomDomaine }) }}</h3>
      <ul v-if="feuille.voisinesDomaine.length" class="grille"><li v-for="e in feuille.voisinesDomaine" :key="e.slug"><FichesPretesCarte :entree="e" compacte :niveau-titre="4" /></li></ul>
      <p v-else class="vide">{{ t('feuille.aucuneDomaine') }}</p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { texteDe } from '../telechargements/recherche.ts'
import type { Feuille } from '../telechargements/useFeuille.ts'
import FichesPretesCarte from './FichesPretesCarte.vue'

const props = defineProps<{ feuille: Feuille }>()
const { t, langueAffichee } = useLangue()
const idTitre = useId()
const nomDomaine = computed(() => (props.feuille.domaine ? texteDe(props.feuille.domaine.nom, langueAffichee.value) : ''))
</script>

<style scoped>
.boite { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1rem 1.1rem; margin-top: 1.6rem; }
h3 { font-size: 1rem; font-weight: 800; margin: .3rem 0 .6rem; }
h3:not(:first-of-type) { margin-top: 1.2rem; }
.grille { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: .8rem; }
.vide { color: var(--texte-doux); font-size: .9rem; }
</style>
