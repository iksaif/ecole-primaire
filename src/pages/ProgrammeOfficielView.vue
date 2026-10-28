<template>
  <div class="container" data-page="programme-officiel">
    <BandeauConstruction />
    <FilAriane :maillons="maillons" :etiquette="t('competence.fil')" />
    <h1 class="section-heading"><span aria-hidden="true"><Icone nom="programme" /></span> {{ t('competence.parcours.titre') }}</h1>
    <p class="chapeau">{{ t('competence.parcours.chapeau') }}</p>

    <nav class="sommaire" :aria-label="t('competence.parcours.sommaire')">
      <ul>
        <li v-for="texte in textes" :key="texte.source"><a :href="`#${texte.source}`">{{ nomDeSource(langueAffichee, texte.source) }}</a></li>
      </ul>
    </nav>

    <section v-for="texte in textes" :id="texte.source" :key="texte.source" class="texte" :aria-labelledby="`h-${texte.source}`">
      <h2 :id="`h-${texte.source}`" :lang="LANGUE_SOURCE">{{ texte.titre }}</h2>
      <p class="liens">
        <span class="precision">{{ nomDeSource(langueAffichee, texte.source) }} · {{ t('competence.parcours.pages', { n: texte.pages.length }) }}</span>
        <a :href="texte.pages[0].url" target="_blank" rel="noopener noreferrer">{{ t('competence.parcours.ouvrirPdf') }}<span class="sr-only"> ({{ t('competence.officiel.ouvre') }})</span> ↗</a>
        <a v-if="texte.presentation" :href="texte.presentation" target="_blank" rel="noopener noreferrer">{{ t('competence.parcours.presentation') }} ↗</a>
      </p>
      <ol class="pages">
        <li v-for="p in texte.pages" :key="p.page">
          <a class="numero" :href="p.url" target="_blank" rel="noopener noreferrer" :aria-label="`${t('programme.reference.page', { page: p.page })}, ${t('competence.officiel.ouvre')}`">{{ t('programme.reference.page', { page: p.page }) }} ↗</a>
          <ul class="competences">
            <li v-for="k in p.competences" :key="k.id"><RouterLink :to="versCompetence(k.id)" :lang="LANGUE_SOURCE">{{ k.libelle }}</RouterLink></li>
          </ul>
        </li>
      </ol>
    </section>

    <p class="retour"><RouterLink to="/programme">{{ t('competence.parcours.retour') }}</RouterLink></p>
  </div>
</template>

<script setup lang="ts">
import Icone from '../images/Icone.vue'
// Parcourir le programme officiel (/programme/officiel) : chaque texte cité par le site, page du PDF par page, avec les compétences qui s'y
// appuient et un lien vers le PDF à cette page. Complète la page « Le programme » (classe × domaine) : ici, l'entrée est le texte lui-même.
import { useRoute } from 'vue-router'
import { extraireParamsContexte } from '../contexte/url.ts'
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import BandeauConstruction from '../shell/BandeauConstruction.vue'
import FilAriane from '../shell/FilAriane.vue'
import type { Maillon } from '../shell/FilAriane.vue'
import { adresseCompetence } from '../programme/adresse.ts'
import { textesOfficiels } from '../programme/navigation.ts'
import { nomDeSource } from '../programme/references.ts'

const { t, langueAffichee } = useLangue()
const route = useRoute()
const textes = textesOfficiels()
const versCompetence = (id: string): string => adresseCompetence(id, null, extraireParamsContexte(route.query))

const maillons: Maillon[] = [
  { texte: t('competence.accueil'), vers: '/', icone: 'accueil' },
  { texte: t('competence.programme'), vers: '/programme', icone: 'programme' },
  { texte: t('competence.parcours.titre'), icone: 'programme' },
]
</script>

<style scoped>
.container :deep(a:not(.classe):not(.case)) { color: var(--bleu-fort); }
.chapeau { color: #555; margin: -.5rem 0 1rem; max-width: 46rem; }
.sommaire ul { list-style: none; display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: 1rem; }
.sommaire a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 .8rem; border-radius: 999px; background: #fff; box-shadow: var(--shadow); font-weight: 700; text-decoration: none; }
.texte { background: #fff; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1rem 1.1rem; margin-bottom: 1rem; scroll-margin-top: 4rem; }
h2 { font-size: 1.05rem; margin-bottom: .3rem; }
.liens { display: flex; flex-wrap: wrap; gap: .3rem 1rem; margin-bottom: .6rem; }
.liens a { font-weight: 700; display: inline-flex; align-items: center; min-height: 44px; }
.precision { color: var(--texte-doux); align-self: center; }
.pages { list-style: none; display: grid; gap: .5rem; }
.pages > li { display: grid; grid-template-columns: 7rem 1fr; gap: .3rem .8rem; border-top: 1px solid var(--gris-brd); padding-top: .5rem; }
.numero { font-weight: 700; display: inline-flex; align-items: center; min-height: 44px; }
.competences { list-style: none; display: grid; gap: .25rem; align-content: center; }
.competences a { font-weight: 600; display: inline-flex; align-items: center; min-height: 44px; }
.retour { margin-top: 1rem; font-weight: 700; }
@media (max-width: 520px) { .pages > li { grid-template-columns: 1fr; } }
</style>
