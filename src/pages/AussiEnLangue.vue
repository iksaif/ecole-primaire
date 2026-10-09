<template>
  <section v-if="groupes.length" class="aussi" :aria-labelledby="id">
    <h2 :id="id"><IconeMatiere matiere="regionale" :langue="langue" /> {{ t('regionale.aussiTitre', { nom }) }}</h2>
    <p class="aide">{{ t('regionale.aussiTexte', { nom }) }}</p>
    <section v-for="g in groupes" :key="g.matiere" class="matiere" :aria-labelledby="`${id}-${g.matiere}`">
      <h3 :id="`${id}-${g.matiere}`"><IconeMatiere :matiere="g.matiere" /> {{ t(NOM_COURT[g.matiere]) }}</h3>
      <ul :class="vue === 'liste' ? 'lignes' : 'cartes'">
        <li v-for="r in g.ressources" :key="r.id"><CarteRessource :ressource="r" :classes-choisies="classes" :langue-contenu="langue" /></li>
      </ul>
    </section>
  </section>
</template>

<script setup lang="ts">
// Page de la langue régionale : après ses domaines (ce qui travaille une compétence de la langue), les autres matières qui existent dans
// cette langue (en classe bilingue, les maths et le monde s'apprennent aussi dans la langue), rangées par matière ; chacune s'ouvre dans
// la langue (CarteRessource `langue-contenu`).
import { computed, useId } from 'vue'
import type { Vue } from '../contexte/types.ts'
import { LANGUES } from '../langues/registre.ts'
import type { Langue } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import { filtrerParClasses } from '../ressources/filtres.ts'
import { competenceDe, domaineDe } from '../data/programme.ts'
import { useAffichable } from '../ressources/useAffichable.ts'
import type { Classe, RessourceDeContenu } from '../ressources/types.ts'
import CarteRessource from '../ressources/composants/CarteRessource.vue'
import IconeMatiere from '../shell/IconeMatiere.vue'
import { MATIERES_PAGE, NOM_COURT } from './matieres.ts'

const props = defineProps<{ langue: Langue, classes: readonly Classe[], vue: Vue }>()
const { t, langueAffichee } = useLangue()
const { affichables: catalogue } = useAffichable()
const id = useId()
const nom = computed(() => LANGUES[props.langue].nom[langueAffichee.value])
/** Déjà rangée dans un domaine de la langue régionale (elle en travaille une compétence) : pas répétée ici. */
const travailleLaLangue = (r: RessourceDeContenu): boolean =>
  r.competences.some(k => domaineDe(competenceDe(k)?.domaine ?? '')?.matiere === 'regionale')

// les ressources personnalisables (pas les fiches toutes prêtes) des pages de matière, dans la langue, pour les classes choisies
const groupes = computed(() => {
  const dansLaLangue = catalogue.value.filter(r => r.type !== 'fiche' && r.langues.includes(props.langue) && !travailleLaLangue(r))
  const choisies = filtrerParClasses(dansLaLangue, props.classes)
  return MATIERES_PAGE.map(matiere => ({ matiere, ressources: choisies.filter(r => r.matiere === matiere) })).filter(g => g.ressources.length)
})
</script>

<style scoped>
.aussi { margin: 1.5rem 0 1rem; }
h2 { font-size: 1.3rem; display: flex; align-items: center; gap: .5rem; }
.aide { color: var(--texte-doux); margin: .2rem 0 1rem; max-width: 640px; }
.matiere { margin-bottom: 1rem; }
h3 { font-size: 1rem; display: flex; align-items: center; gap: .4rem; margin-bottom: .5rem; }
ul { list-style: none; padding: 0; margin: 0; }
.cartes, .lignes { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: .75rem; }
</style>
