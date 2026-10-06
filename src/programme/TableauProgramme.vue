<template>
  <!-- région défilante focalisable (clavier) : la colonne des compétences reste visible, le reste défile horizontalement -->
  <div class="defile" role="region" tabindex="0" :aria-label="legende">
    <table class="prog">
      <caption>{{ legende }}</caption>
      <thead>
        <tr>
          <th scope="col">{{ t('programme.tableau.competence') }}</th>
          <th v-for="c in NIVEAUX" :key="c" scope="col" :class="{ choisie: classes.includes(c) }">
            {{ c.toUpperCase() }}<span v-if="classes.includes(c)" class="sr-only"> ({{ t('programme.tableau.choisie') }})</span>
          </th>
          <th scope="col"><span aria-hidden="true">{{ EMOJI.ressources }}</span><span class="sr-only">{{ t('programme.tableau.ressources') }}</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ligne in lignes" :key="ligne.competence.id">
          <th scope="row" class="competence">
            <RouterLink :to="adresseCompetence(ligne.competence.id, null, reportes)" :lang="LANGUE_SOURCE">{{ ligne.competence.libelle }}</RouterLink>
            <LectureInterpretation v-if="ligne.competence.interpretation" :texte="ligne.competence.interpretation" />
          </th>
          <td v-for="cellule in ligne.cellules" :key="cellule.classe" :class="{ choisie: cellule.choisie }">
            <template v-if="cellule.concernee">
              <RouterLink class="case" :to="adresseCompetence(ligne.competence.id, cellule.classe, reportes)">
                <span aria-hidden="true">●</span>
                <span class="sr-only">{{ t('programme.tableau.cellule', { competence: ligne.competence.libelle, classe: cellule.classe.toUpperCase() }) }}</span>
              </RouterLink>
              <EtiquetteReference v-if="refs" :reference="ligne.reference" />
            </template>
            <template v-else>
              <span aria-hidden="true" class="absente">·</span><span class="sr-only">{{ t('programme.tableau.nonConcernee') }}</span>
            </template>
          </td>
          <td>{{ ligne.ressources.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p class="cle">{{ t('programme.tableau.cle') }}</p>
</template>

<script setup lang="ts">
// Le tableau du programme : une ligne par compétence, une colonne par classe. Chaque case est un lien vers la page de la
// compétence (avec la classe dans l'adresse) ; l'étiquette de référence est un lien distinct (jamais un lien dans un lien).
import { computed } from 'vue'
import { NIVEAUX } from '../data/classes.ts'
import type { Classe } from '../data/classes.ts'
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import { adresseCompetence } from './adresse.ts'
import type { ParamsReportes } from './adresse.ts'
import { EMOJI } from './emojis.ts'
import EtiquetteReference from './EtiquetteReference.vue'
import LectureInterpretation from './LectureInterpretation.vue'
import { nomDuDomaine } from './noms.ts'
import type { LigneProgramme } from './tableau.ts'

const props = defineProps<{ lignes: readonly LigneProgramme[], classes: readonly Classe[], domaine: string, refs: boolean, reportes: ParamsReportes }>()
const { t, langueAffichee } = useLangue()
const legende = computed(() => t('programme.tableau.legende', { domaine: nomDuDomaine(props.domaine, langueAffichee.value) }))
</script>

<style scoped>
.defile { position: relative; overflow-x: auto; border-radius: var(--radius); box-shadow: var(--shadow); background: #fff; }
.prog { width: 100%; border-collapse: separate; border-spacing: 0; font-size: .9rem; }
caption { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
th, td { padding: .5rem .6rem; border-bottom: 1px solid var(--gris-brd); text-align: center; vertical-align: middle; background: #fff; }
thead th { background: var(--gris-bg); font-size: .78rem; text-transform: uppercase; color: #555; }
thead th.choisie { background: var(--bleu-fort); color: #fff; }
td.choisie { background: #eef5fd; }
.competence { text-align: left; font-weight: 600; min-width: 11rem; max-width: 20rem; }
/* colonne des compétences collante : elle reste visible pendant le défilement horizontal */
th.competence, thead th:first-child { position: sticky; left: 0; z-index: 1; box-shadow: 2px 0 4px rgba(0, 0, 0, .08); }
thead th:first-child { z-index: 2; text-align: left; background: var(--gris-bg); }
.case { display: inline-flex; align-items: center; justify-content: center; min-width: 2.75rem; min-height: 2.75rem; color: var(--texte); text-decoration: none; border-radius: 8px; font-size: 1.3rem; }
.case:hover { background: #e8f1fc; color: var(--bleu-fort); }
.absente { color: #767676; }
td :deep(.reference) { display: block; max-width: 5.5rem; margin: 0 auto; }
@media (max-width: 700px) { .competence { min-width: 8rem; max-width: 8rem; font-size: .78rem; } }
.cle { margin-top: .5rem; font-size: .85rem; color: var(--texte-doux); }
</style>
