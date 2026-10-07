<template>
  <!-- Les fiches toutes prêtes d'une matière : /maths/fiches, /francais/fiches, /monde/fiches. Lit fiches/index.json (écrit par
       `npm run fiches`) ; la classe, le mode de langue et la présentation (cartes ou liste) viennent du contexte, dans l'adresse. -->
  <div class="container">
    <FilAriane :maillons="maillons" :etiquette="t('fichesPretes.fil')" />
    <h1>{{ t('fichesPretes.titre', { matiere: nomMatiere }) }}</h1>
    <p class="lead">{{ t('fichesPretes.intro') }}</p>

    <FichesPretesEtat v-if="page.etat.etat !== 'pret'" :etat="page.etat" @reessayer="page.recharger()" />
    <p v-else-if="page.vide" class="vide" role="status">{{ t('fichesPretes.vide') }}</p>

    <template v-else-if="page.index">
      <FichesPretesFiltres :page="page" />

      <div class="barre">
        <FichesPretesCompteur :page="page" />
        <SelecteurVue />
      </div>

      <template v-if="page.resultats.length">
        <FichesPretesTable v-if="vue === 'liste'" :entrees="page.resultats" :index="page.index" :legende="nomMatiere" :selection="page.selection" />
        <ul v-else class="grille">
          <li v-for="e in page.resultats" :key="e.slug"><FichesPretesCarte :entree="e" :selection="page.selection" /></li>
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
          <RouterLink v-if="pageDeLaMatiere" class="btn btn-primary" :to="pageDeLaMatiere">{{ t('fichesPretes.personnaliser') }}</RouterLink>
          <RouterLink class="btn btn-ghost" to="/telechargements">{{ t('fichesPretes.toutesLesFiches') }}</RouterLink>
        </p>
      </aside>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { useRoute } from 'vue-router'
import { SITE } from '../sites.ts'
import { LANGUES } from '../langues/registre.ts'
import { majuscule } from '../ressources/composants/presentation.ts'
import { useLangue } from '../langues/useLangue.ts'
import { cheminMatiere } from '../telechargements/pages.ts'
import type { Matiere } from '../telechargements/types.ts'
import { useFichesPage } from '../telechargements/useFichesPage.ts'
import FichesPretesCarte from './FichesPretesCarte.vue'
import FichesPretesCompteur from './FichesPretesCompteur.vue'
import FichesPretesEtat from './FichesPretesEtat.vue'
import FilAriane from '../shell/FilAriane.vue'
import FichesPretesFiltres from './FichesPretesFiltres.vue'
import FichesPretesTable from './FichesPretesTable.vue'
import { EMOJI_BARRE } from '../shell/emojis.ts'
import SelecteurVue from '../ressources/composants/SelecteurVue.vue'

const props = defineProps<{ matiere: Matiere }>()
const { t } = useLangue()
const page = useFichesPage(() => props.matiere)
const idEncart = useId()
const vue = computed(() => page.contexte.vue)

// la langue régionale porte le nom de la langue (« Brezhoneg »)
const regionale = SITE.languesRegionales[0]
const nomMatiere = computed(() => (props.matiere === 'regionale' && regionale ? majuscule(LANGUES[regionale].nomLocal) : t(`fichesPretes.matieres.${props.matiere}`)))
// la page de la matière : /maths… ; pour la langue régionale, l'adresse de cette page sans « /fiches » (/brezhoneg)
const route = useRoute()
const pageDeLaMatiere = computed(() => cheminMatiere(props.matiere) ?? (props.matiere === 'regionale' ? route.path.replace(/\/fiches$/, '') : null))
const maillons = computed(() => [
  { texte: t('fichesPretes.accueil'), vers: '/', emoji: EMOJI_BARRE.accueil },
  { texte: nomMatiere.value, vers: pageDeLaMatiere.value ?? undefined, matiere: props.matiere },
  { texte: t('fichesPretes.fichesPretes'), emoji: EMOJI_BARRE.fichesPretes },
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
