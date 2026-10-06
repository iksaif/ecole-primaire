<template>
  <!-- L'index de toutes les fiches prêtes : /telechargements. Par matière, de A à Z, avec les mêmes filtres que la page d'une matière
       (toutes les classes au départ). Les moteurs de recherche et les familles y arrivent pour parcourir l'ensemble. -->
  <div class="container">
    <FichesPretesFil :maillons="maillons" />
    <h1>{{ t('fichesPretes.titreIndex') }}</h1>
    <p class="lead">{{ t('fichesPretes.introIndex') }}</p>

    <FichesPretesEtat v-if="page.etat.etat !== 'pret'" :etat="page.etat" @reessayer="page.recharger()" />
    <p v-else-if="page.vide" class="vide" role="status">{{ t('fichesPretes.vide') }}</p>

    <template v-else-if="page.index">
      <FichesPretesFiltres :page="page" />
      <FichesPretesCompteur :page="page" />

      <section v-for="g in groupes" :key="g.matiere" class="matiere" :aria-labelledby="`m-${g.matiere}`">
        <h2 :id="`m-${g.matiere}`">{{ t(`fichesPretes.matieres.${g.matiere}`) }}</h2>
        <FichesPretesTable :entrees="g.entrees" :index="page.index" :legende="t(`fichesPretes.matieres.${g.matiere}`)" :selection="page.selection" :avec-langues="page.bilingue" />
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
import FichesPretesCompteur from './FichesPretesCompteur.vue'
import FichesPretesEtat from './FichesPretesEtat.vue'
import FichesPretesFil from './FichesPretesFil.vue'
import FichesPretesFiltres from './FichesPretesFiltres.vue'
import FichesPretesTable from './FichesPretesTable.vue'

const { t, langueAffichee } = useLangue()
const page = useFichesPage(() => null, { toutesLesClasses: true })

const maillons = computed(() => [{ texte: t('fichesPretes.accueil'), vers: '/' }, { texte: t('fichesPretes.titreIndex') }])
const groupes = computed(() => (page.index ? grouperParMatiere(page.index, page.resultats, MATIERES, langueAffichee.value) : []))
</script>

<style scoped>
h1 { font-size: 1.9rem; font-weight: 900; line-height: 1.2; margin-bottom: .35rem; }
.lead { color: var(--texte-doux); font-size: 1.05rem; margin-bottom: 1rem; }
.vide { color: var(--texte-doux); padding: 1.5rem 0; display: flex; flex-direction: column; gap: .75rem; align-items: flex-start; }
.matiere { margin-top: 1.5rem; }
.matiere h2 { font-size: 1.3rem; font-weight: 800; }
</style>
