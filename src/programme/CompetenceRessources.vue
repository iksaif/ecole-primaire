<template>
  <section aria-labelledby="h-ressources">
    <h2 id="h-ressources"><span aria-hidden="true">{{ EMOJI.programme }}</span> {{ t('competence.ressources.titre') }}
      <span class="nombre">{{ t('competence.ressources.nombre', { n: ressources.length }) }}</span></h2>
    <div v-for="g in groupes" :key="g.cle" class="groupe">
      <h3>{{ t(`competence.groupes.${g.cle}`) }}</h3>
      <ul v-if="g.ressources.length" class="liste">
        <li v-for="r in g.ressources" :key="r.id"><CarteRessource :ressource="r" :classes-choisies="classes" :niveau-titre="4" /></li>
      </ul>
      <p v-else class="vide">{{ t(`competence.vide.${g.cle}`) }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
// Toutes les ressources liées à une compétence, en trois groupes (exercices et générateurs, affiches, fiches toutes prêtes) ;
// un groupe vide le dit honnêtement. Les cartes sont celles de src/ressources/composants/ (mêmes que les pages de matière).
import { computed } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import CarteRessource from '../ressources/composants/CarteRessource.vue'
import type { Classe, RessourceDeContenu } from '../ressources/types.ts'
import { EMOJI } from './emojis.ts'

const props = defineProps<{ ressources: readonly RessourceDeContenu[], classes: readonly Classe[] }>()
const { t } = useLangue()
const groupes = computed(() => (['exercices', 'affiches', 'fiches'] as const).map(cle => ({
  cle, ressources: props.ressources.filter(r => r.type === ({ exercices: 'exercice', affiches: 'affiche', fiches: 'fiche' } as const)[cle]),
})))
</script>

<style scoped>
h2 { font-size: 1.15rem; margin: 0 0 .6rem; }
h3 { font-size: 1rem; margin: .8rem 0 .4rem; }
.nombre { font-size: .85rem; font-weight: 600; color: var(--texte-doux); margin-left: .4rem; }
.liste { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: .8rem; }
.vide { color: var(--texte-doux); }
</style>
