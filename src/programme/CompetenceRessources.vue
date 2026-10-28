<template>
  <section aria-labelledby="h-ressources">
    <h2 id="h-ressources"><span aria-hidden="true"><Icone nom="programme" /></span> {{ t('competence.ressources.titre') }}
      <span class="nombre">{{ t('competence.ressources.nombre', { n: ressources.length }) }}</span></h2>
    <div v-if="!groupes.length" class="vide">
      <p>{{ t('competence.sansRessource.message') }}</p>
      <p>{{ t('competence.sansRessource.suite') }}</p>
      <p>{{ t('competence.sansRessource.aide') }} <a :href="lienMail">{{ SITE.contact }}</a></p>
    </div>
    <div v-for="g in groupes" :key="g.cle" class="groupe">
      <h3>{{ t(`competence.groupes.${g.cle}`) }}</h3>
      <ul class="liste">
        <li v-for="r in g.ressources" :key="r.id"><CarteRessource :ressource="r" :classes-choisies="classes" :niveau-titre="4" /></li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import Icone from '../images/Icone.vue'
// Toutes les ressources liées à une compétence, en trois groupes (exercices et générateurs, affiches, fiches toutes prêtes) ;
// un groupe sans ressource n'est pas montré ; sans aucune ressource, un message le dit (nous y travaillons, un contact). Les cartes sont celles de src/ressources/composants/ (mêmes que les pages de matière).
import { computed } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { SITE } from '../sites.ts'
import CarteRessource from '../ressources/composants/CarteRessource.vue'
import type { Classe, RessourceDeContenu } from '../ressources/types.ts'

const props = defineProps<{ ressources: readonly RessourceDeContenu[], classes: readonly Classe[], competence: string }>()
const { t } = useLangue()
/** « Une idée pour cette compétence ? » : un courriel au contact du site, avec la compétence en objet (rien n'est enregistré) */
const lienMail = computed(() => `mailto:${SITE.contact}?subject=${encodeURIComponent(t('competence.sansRessource.sujet', { competence: props.competence }))}`)
const groupes = computed(() => (['exercices', 'affiches', 'fiches'] as const).map(cle => ({
  cle, ressources: props.ressources.filter(r => r.type === ({ exercices: 'exercice', affiches: 'affiche', fiches: 'fiche' } as const)[cle]),
})).filter(g => g.ressources.length))
</script>

<style scoped>
h2 { font-size: 1.15rem; margin: 0 0 .6rem; }
h3 { font-size: 1rem; margin: .8rem 0 .4rem; }
.nombre { font-size: .85rem; font-weight: 600; color: var(--texte-doux); margin-left: .4rem; }
.liste { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: .8rem; }
.vide { color: var(--texte-doux); display: grid; gap: .4rem; background: #fff8e6; border-left: 4px solid var(--orange); border-radius: 6px; padding: .6rem .8rem; }
.vide a { font-weight: 700; display: inline-block; min-height: 44px; line-height: 44px; }
</style>
