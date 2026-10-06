<template>
  <!-- L'index de toutes les fiches prêtes : /telechargements. Par matière, de A à Z, avec les mêmes filtres et la même présentation
       (cartes ou liste) que la page d'une matière ; les classes viennent du contexte (adresse d'abord), « Toutes les classes » est à un clic.
       Les moteurs de recherche et les familles y arrivent pour parcourir l'ensemble. -->
  <div class="container">
    <FilAriane :maillons="maillons" :etiquette="t('fichesPretes.fil')" />
    <h1>{{ t('fichesPretes.titreIndex') }}</h1>
    <p class="lead">{{ t('fichesPretes.introIndex') }}</p>

    <FichesPretesEtat v-if="page.etat.etat !== 'pret'" :etat="page.etat" @reessayer="page.recharger()" />
    <p v-else-if="page.vide" class="vide" role="status">{{ t('fichesPretes.vide') }}</p>

    <template v-else-if="page.index">
      <FichesPretesFiltres :page="page" />
      <div class="barre">
        <FichesPretesCompteur :page="page" />
        <SelecteurVue :vue="vue" @choisie="apresChoix" />
      </div>

      <section v-for="g in groupes" :key="g.matiere" class="matiere" :aria-labelledby="`m-${g.matiere}`">
        <h2 :id="`m-${g.matiere}`"><span aria-hidden="true">{{ EMOJI_MATIERE[g.matiere] }}</span> {{ t(`fichesPretes.matieres.${g.matiere}`) }}</h2>
        <FichesPretesTable v-if="vue === 'liste'" :entrees="g.entrees" :index="page.index" :legende="t(`fichesPretes.matieres.${g.matiere}`)" :selection="page.selection" :avec-langues="page.bilingue" />
        <ul v-else class="grille">
          <li v-for="e in g.entrees" :key="e.slug"><FichesPretesCarte :entree="e" :selection="page.selection" :avec-langues="page.bilingue" /></li>
        </ul>
      </section>
      <div v-if="!groupes.length" class="vide" role="status">
        <p>{{ t('fichesPretes.aucune') }}</p>
        <button v-if="page.filtre" type="button" class="btn btn-ghost" @click="page.effacer()">{{ t('fichesPretes.effacer') }}</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MATIERES } from '../data/programme.ts'
import { useLangue } from '../langues/useLangue.ts'
import { grouperParMatiere } from '../telechargements/pages.ts'
import { useFichesPage } from '../telechargements/useFichesPage.ts'
import SelecteurVue from '../ressources/composants/SelecteurVue.vue'
import { EMOJI_MATIERE } from '../ressources/composants/presentation.ts'
import { useVueAffichee } from '../ressources/composants/useVueAffichee.ts'
import FichesPretesCarte from './FichesPretesCarte.vue'
import FichesPretesCompteur from './FichesPretesCompteur.vue'
import FichesPretesEtat from './FichesPretesEtat.vue'
import FilAriane from '../shell/FilAriane.vue'
import { EMOJI_BARRE } from '../shell/emojis.ts'
import FichesPretesFiltres from './FichesPretesFiltres.vue'
import FichesPretesTable from './FichesPretesTable.vue'

const { t, langueAffichee } = useLangue()
const page = useFichesPage(() => null)
const { vue, apresChoix } = useVueAffichee()

const maillons = computed(() => [{ texte: t('fichesPretes.accueil'), vers: '/', emoji: EMOJI_BARRE.accueil }, { texte: t('fichesPretes.titreIndex'), emoji: EMOJI_BARRE.fichesPretes }])
const groupes = computed(() => (page.index ? grouperParMatiere(page.index, page.resultats, MATIERES, langueAffichee.value) : []))
</script>

<style scoped>
h1 { font-size: 1.9rem; font-weight: 900; line-height: 1.2; margin-bottom: .35rem; }
.lead { color: var(--texte-doux); font-size: 1.05rem; margin-bottom: 1rem; }
.vide { color: var(--texte-doux); padding: 1.5rem 0; display: flex; flex-direction: column; gap: .75rem; align-items: flex-start; }
.barre { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .5rem; margin: .8rem 0 0; }
.grille { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-top: .8rem; }
.matiere { margin-top: 1.5rem; }
.matiere h2 { font-size: 1.3rem; font-weight: 800; }
</style>
