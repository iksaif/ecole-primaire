<template>
  <div class="container" data-page="programme">
    <FilAriane :maillons="maillons" :etiquette="t('programme.fil')" />
    <h1 class="section-heading"><span aria-hidden="true">{{ EMOJI.programme }}</span> {{ t('programme.titre') }}</h1>
    <p class="chapeau">{{ t('programme.chapeau', { classes: classesTexte, matiere: t(`programme.matiere.${etat.matiere}`) }) }}</p>

    <BarreProgramme :etat="etat" :affichage="affichage" :domaines="domaines" :lien="lienDeCetteVue"
      @matiere="choisirMatiere" @domaine="choisirDomaine" @affichage="choisirAffichage" />

    <section v-if="etat.domaine" class="domaine" aria-labelledby="h-domaine">
      <h2 id="h-domaine">{{ EMOJI_DOMAINE[etat.domaine] }} {{ nomDuDomaine(etat.domaine, langueAffichee) }}</h2>
      <TableauProgramme v-if="affichage === 'tableau'" :lignes="lignes" :classes="contexte.classes" :domaine="etat.domaine" :refs="contexte.refs" :reportes="reportes" />
      <ListeProgramme v-else :lignes="lignes" :classes="contexte.classes" :refs="contexte.refs" :reportes="reportes" />
    </section>
    <p class="adresse">{{ t('programme.adresse') }} : <code>{{ lienDeCetteVue() }}</code></p>
  </div>
</template>

<script setup lang="ts">
// Page « Le programme » (/programme) : classe × domaine → compétences → ressources, en tableau ou en liste. L'état est dans
// l'adresse (matière, domaine, présentation, classes, références) : une adresse partagée rouvre la même vue.
import { computed } from 'vue'
import { useContexte } from '../contexte/useContexte.ts'
import { EMOJI_BARRE } from '../shell/emojis.ts'
import { texteClasses } from '../data/classes.ts'
import FilAriane from '../shell/FilAriane.vue'
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI_DOMAINE } from '../ressources/emojis.ts'
import BarreProgramme from '../programme/BarreProgramme.vue'
import { EMOJI } from '../programme/emojis.ts'
import { domainesProposes } from '../programme/etat.ts'
import ListeProgramme from '../programme/ListeProgramme.vue'
import { nomDuDomaine } from '../programme/noms.ts'
import TableauProgramme from '../programme/TableauProgramme.vue'
import { useProgramme } from '../programme/useProgramme.ts'

const { t, langueAffichee } = useLangue()
const { contexte } = useContexte()
const { etat, affichage, lignes, reportes, choisirMatiere, choisirDomaine, choisirAffichage, lienDeCetteVue } = useProgramme()
const domaines = computed(() => domainesProposes(etat.value.matiere, contexte.value.classes))
const maillons = computed(() => [
  { texte: t('programme.accueil'), vers: '/', emoji: EMOJI_BARRE.accueil },
  { texte: t('programme.titre'), emoji: EMOJI.programme },
])
const classesTexte = computed(() => texteClasses(contexte.value.classes))
</script>

<style scoped>
.container :deep(a:not(.classe):not(.case)) { color: var(--bleu-fort); }
.chapeau { color: #555; margin: -.5rem 0 .5rem; }
.adresse { margin-top: 1rem; font-size: .85rem; color: var(--texte-doux); }
.adresse code { word-break: break-all; }
.domaine h2 { font-size: 1.15rem; margin-bottom: .6rem; }
</style>
