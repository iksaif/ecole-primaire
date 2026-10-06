<template>
  <p v-if="!choisies.length" class="vide">{{ t('programme.liste.aucune') }}</p>
  <ul v-else class="competences">
    <li v-for="ligne in choisies" :key="ligne.competence.id" class="competence">
      <h3>
        <RouterLink :to="adresseCompetence(ligne.competence.id, premiereClasse(ligne), reportes)" :lang="LANGUE_SOURCE">
          <span aria-hidden="true">{{ EMOJI.competence }}</span> {{ ligne.competence.libelle }}
        </RouterLink>
        <LectureInterpretation v-if="ligne.competence.interpretation" :texte="ligne.competence.interpretation" />
      </h3>
      <p class="classes">
        <span v-for="c in ligne.competence.niveaux" :key="c" class="classe" :class="{ choisie: classes.includes(c) }">{{ c.toUpperCase() }}</span>
        <EtiquetteReference v-if="refs" :reference="ligne.reference" />
      </p>
      <ul v-if="ligne.pourLesClasses.length" class="ressources">
        <li v-for="r in ligne.pourLesClasses" :key="r.id"><LigneRessource :ressource="r" :classes-choisies="classes" /></li>
      </ul>
      <p v-else class="sans">{{ t('programme.sansRessource') }}</p>
      <p v-if="ligne.ressources.length > ligne.pourLesClasses.length" class="autres">
        <RouterLink :to="adresseCompetence(ligne.competence.id, premiereClasse(ligne), reportes)">
          {{ t('programme.liste.autresClasses', { n: ligne.ressources.length - ligne.pourLesClasses.length }) }}
        </RouterLink>
      </p>
    </li>
  </ul>
</template>

<script setup lang="ts">
// Présentation par défaut (le tableau en est l'alternative) : une carte par compétence des classes choisies, avec ses ressources.
import { computed } from 'vue'
import type { Classe } from '../data/classes.ts'
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import LigneRessource from '../ressources/composants/LigneRessource.vue'
import { adresseCompetence } from './adresse.ts'
import type { ParamsReportes } from './adresse.ts'
import { EMOJI } from './emojis.ts'
import EtiquetteReference from './EtiquetteReference.vue'
import LectureInterpretation from './LectureInterpretation.vue'
import { classesEnCommun } from './tableau.ts'
import type { LigneProgramme } from './tableau.ts'

const props = defineProps<{ lignes: readonly LigneProgramme[], classes: readonly Classe[], refs: boolean, reportes: ParamsReportes }>()
const { t } = useLangue()
const choisies = computed(() => props.lignes.filter(l => l.choisie))
const premiereClasse = (l: LigneProgramme): Classe | null => classesEnCommun(l.competence, props.classes)[0] ?? null
</script>

<style scoped>
.competences { list-style: none; display: grid; gap: .8rem; }
.competence { background: #fff; border-radius: var(--radius); box-shadow: var(--shadow); padding: .9rem 1.1rem; border-left: 5px solid var(--violet); }
h3 { font-size: 1rem; margin-bottom: .3rem; }
.classes { display: flex; flex-wrap: wrap; align-items: center; gap: .3rem .5rem; margin-bottom: .5rem; }
.classe { font-size: .75rem; font-weight: 700; padding: .05rem .5rem; border-radius: 999px; background: var(--gris-bg); border: 1px solid var(--gris-brd); }
.classe.choisie { background: var(--bleu-fort); border-color: var(--bleu-fort); color: #fff; }
.ressources { list-style: none; }
.sans, .vide { color: var(--texte-doux); }
.autres { margin-top: .4rem; font-size: .85rem; }
</style>
