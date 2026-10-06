<template>
  <div v-if="matiere" class="container" :data-page="matiere">
    <nav class="fil" :aria-label="t('matiere.fil')">
      <RouterLink to="/">🏠 {{ t('matiere.accueil') }}</RouterLink> <span aria-hidden="true">›</span> <span aria-current="page">{{ nom }}</span>
    </nav>
    <h1 class="titre"><span aria-hidden="true">{{ EMOJI_MATIERE[matiere] }}</span> {{ nom }}</h1>

    <aside class="fiches-pretes">
      <span class="emoji" aria-hidden="true">{{ EMOJI_ACCUEIL.fiches }}</span>
      <p><strong>{{ t('matiere.fichesTitre') }}</strong><br>{{ t('matiere.fichesTexte') }}</p>
      <RouterLink :to="cheminFiches(matiere)" class="gros-bouton">{{ EMOJI_ACCUEIL.fiches }} {{ t('matiere.fichesBouton') }}</RouterLink>
    </aside>

    <MondeIntro v-if="matiere === 'monde'" />

    <div class="barre">
      <p class="classes">
        <span aria-hidden="true">{{ EMOJI_ACCUEIL.classe }}</span> {{ t('matiere.classe', { n: classes.length }) }} :
        <strong>{{ classesEnTexte(classes) }}</strong> · {{ t('ressource.ressources', { n: total }) }}
      </p>
      <SelecteurVue :vue="vue" @choisie="apresChoix" />
    </div>

    <p v-if="!pret" class="chargement" role="status">{{ t('matiere.chargement') }}</p>
    <EtatVide v-else-if="!avecRessources.length" :emoji="EMOJI_ACCUEIL.aVenir" :titre="t('matiere.videTitre')" :texte="t('matiere.videTexte')" />
    <GroupeDomaine v-for="g in avecRessources" :key="g.domaine" :groupe="g" :classes="classes" :vue="vue" />

    <MatiereAVenir v-if="pret && aVenir.length" :domaines="aVenir" :classes="classes" />
  </div>
</template>

<script setup lang="ts">
// Page d'une matière (/maths, /francais, /monde : la matière vient de la route). Les domaines sont ceux du programme des cycles
// des classes choisies (grouperParDomaine) : ceux qui ont des ressources s'affichent en cartes ou en liste, les autres en « à venir ».
// Une ressource n'y est qu'une fois, avec ses classes en pastilles ; les classes choisies filtrent (union) et sont mises en évidence.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useContexte } from '../contexte/useContexte.ts'
import { useLangue } from '../langues/useLangue.ts'
import { filtrerParMode, grouperParDomaine } from '../ressources/filtres.ts'
import { useRessources } from '../ressources/useRessources.ts'
import EtatVide from '../ressources/composants/EtatVide.vue'
import GroupeDomaine from '../ressources/composants/GroupeDomaine.vue'
import SelecteurVue from '../ressources/composants/SelecteurVue.vue'
import { EMOJI_ACCUEIL, EMOJI_MATIERE, classesEnTexte } from '../ressources/composants/presentation.ts'
import { useVueAffichee } from '../ressources/composants/useVueAffichee.ts'
import { TITRE_MATIERE, cheminFiches, matiereDeLaRoute } from './matieres.ts'
import MatiereAVenir from './MatiereAVenir.vue'
import MondeIntro from './MondeIntro.vue'

const route = useRoute()
const { t } = useLangue()
const { contexte } = useContexte()
const { catalogue, pret } = useRessources()
const { vue, apresChoix } = useVueAffichee()

const matiere = computed(() => matiereDeLaRoute(route.path))
const nom = computed(() => (matiere.value ? t(TITRE_MATIERE[matiere.value]) : ''))
const classes = computed(() => contexte.value.classes)
const groupes = computed(() => (matiere.value
  ? grouperParDomaine(filtrerParMode(catalogue.value, contexte.value.mode, contexte.value.regionale), { matiere: matiere.value, classes: classes.value })
  : []))
// un domaine sans aucune ressource (pour aucune classe) est « à venir » ; avec des ressources d'autres classes seulement, il reste un groupe replié
const avecRessources = computed(() => groupes.value.filter(g => g.ressources.length + g.horsClasse > 0))
const aVenir = computed(() => groupes.value.filter(g => !g.ressources.length && !g.horsClasse).map(g => g.domaine))
const total = computed(() => avecRessources.value.reduce((n, g) => n + g.ressources.length, 0))
</script>

<style scoped>
.fil { font-size: .9rem; margin-bottom: .5rem; color: var(--texte-doux); }
.fil a { color: var(--bleu-fort); }
.titre { font-size: 2rem; font-weight: 900; margin-bottom: 1rem; }
.fiches-pretes {
  display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; background: #fff8e6; border: 2px solid #f3d38a; border-radius: var(--radius);
  padding: .8rem 1rem; margin-bottom: 1.25rem;
}
.fiches-pretes .emoji { font-size: 2rem; }
.fiches-pretes p { flex: 1 1 16rem; }
.gros-bouton {
  background: var(--bleu-fort); color: white; text-decoration: none; font-weight: 800; border-radius: 8px; padding: .6rem 1rem;
  min-height: 2.75rem; display: inline-flex; align-items: center;
}
.barre { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .6rem 1rem; margin-bottom: 1rem; }
.classes { font-size: .95rem; }
.chargement { color: var(--texte-doux); margin: 1rem 0; }
</style>
