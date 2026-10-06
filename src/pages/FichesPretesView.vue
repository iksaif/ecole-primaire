<template>
  <!-- Les fiches toutes prêtes d'une matière : /maths/fiches, /francais/fiches, /monde/fiches. Lit fiches/index.json (écrit par
       `npm run fiches`) ; la classe, le mode de langue et la présentation (cartes ou liste) viennent du contexte, dans l'adresse. -->
  <div class="container">
    <FichesPretesFil :maillons="maillons" />
    <h1>{{ t('fichesPretes.titre', { matiere: nomMatiere }) }}</h1>
    <p class="lead">{{ t('fichesPretes.intro') }}</p>

    <FichesPretesEtat v-if="page.etat.etat !== 'pret'" :etat="page.etat" @reessayer="page.recharger()" />
    <p v-else-if="page.vide" class="vide" role="status">{{ t('fichesPretes.vide') }}</p>

    <template v-else-if="page.index">
      <FichesPretesFiltres :page="page" />

      <div class="barre">
        <FichesPretesCompteur :page="page" />
        <SelecteurVue :vue="vue" @choisie="apresChoix" />
      </div>

      <template v-if="page.resultats.length">
        <FichesPretesTable v-if="vue === 'liste'" :entrees="page.resultats" :index="page.index" :legende="nomMatiere" :selection="page.selection" :avec-langues="page.bilingue" />
        <ul v-else class="grille">
          <li v-for="e in page.resultats" :key="e.slug"><FichesPretesCarte :entree="e" :selection="page.selection" :avec-langues="page.bilingue" /></li>
        </ul>
      </template>
      <div v-else class="vide" role="status">
        <p>{{ page.filtre ? t('fichesPretes.aucune') : t('fichesPretes.videMatiere') }}</p>
        <button v-if="page.filtre" type="button" class="btn btn-ghost" @click="page.effacer()">{{ t('fichesPretes.effacer') }}</button>
      </div>

      <aside class="encart" :aria-labelledby="idEncart">
        <h2 :id="idEncart">{{ t('fichesPretes.personnaliserTitre') }}</h2>
        <p>{{ t('fichesPretes.personnaliserTexte') }}</p>
        <p class="liens">
          <RouterLink v-if="cheminMatiere(matiere)" class="btn btn-primary" :to="cheminMatiere(matiere) ?? '/'">{{ t('fichesPretes.personnaliser') }}</RouterLink>
          <RouterLink class="btn btn-ghost" to="/telechargements">{{ t('fichesPretes.toutesLesFiches') }}</RouterLink>
        </p>
      </aside>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { cheminMatiere } from '../telechargements/pages.ts'
import type { Matiere } from '../telechargements/types.ts'
import { useFichesPage } from '../telechargements/useFichesPage.ts'
import FichesPretesCarte from './FichesPretesCarte.vue'
import FichesPretesCompteur from './FichesPretesCompteur.vue'
import FichesPretesEtat from './FichesPretesEtat.vue'
import FichesPretesFil from './FichesPretesFil.vue'
import FichesPretesFiltres from './FichesPretesFiltres.vue'
import FichesPretesTable from './FichesPretesTable.vue'
import SelecteurVue from '../ressources/composants/SelecteurVue.vue'
import { useVueAffichee } from '../ressources/composants/useVueAffichee.ts'

const props = defineProps<{ matiere: Matiere }>()
const { t } = useLangue()
const page = useFichesPage(() => props.matiere)
const idEncart = useId()
const { vue, apresChoix } = useVueAffichee()

const nomMatiere = computed(() => t(`fichesPretes.matieres.${props.matiere}`))
const maillons = computed(() => [
  { texte: t('fichesPretes.accueil'), vers: '/' },
  ...(cheminMatiere(props.matiere) ? [{ texte: nomMatiere.value, vers: cheminMatiere(props.matiere) ?? '/' }] : [{ texte: nomMatiere.value }]),
  { texte: t('fichesPretes.fichesPretes') },
])
</script>

<style scoped>
h1 { font-size: 1.9rem; font-weight: 900; line-height: 1.2; margin-bottom: .35rem; }
.lead { color: var(--texte-doux); font-size: 1.05rem; margin-bottom: 1rem; }
.vide { color: var(--texte-doux); padding: 1.5rem 0; display: flex; flex-direction: column; gap: .75rem; align-items: flex-start; }
.barre { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .5rem; margin: .8rem 0 0; }
.grille { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-top: .8rem; }
.encart { margin-top: 2rem; background: white; border-left: 5px solid var(--bleu); border-radius: var(--radius); box-shadow: var(--shadow); padding: 1rem 1.2rem; }
.encart h2 { font-size: 1.1rem; margin-bottom: .3rem; }
.liens { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .7rem; }
.liens .btn { text-decoration: none; }
</style>
