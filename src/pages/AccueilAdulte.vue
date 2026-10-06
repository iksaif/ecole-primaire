<template>
  <div class="adulte">
    <header class="entete">
      <h1>{{ enseignant ? t('accueil.titreEnseignant') : t('accueil.titre') }}</h1>
      <p class="sous-titre">{{ enseignant ? t('accueil.sousTitreEnseignant') : t('accueil.sousTitre') }}</p>
      <AccueilClasses />
      <AccueilCopierLien v-if="enseignant" />
    </header>
    <ul class="tuiles">
      <li v-for="m in tuiles" :key="m.matiere">
        <AccueilTuile :to="m.to" :emoji="m.emoji" :titre="m.titre" :couleur="m.couleur"
          :description="m.matiere === 'monde' ? t('accueil.mondeDesc') : m.n ? t('accueil.compte', { n: m.n, classes: classesTexte }) : t('accueil.aucune', { classes: classesTexte })" />
      </li>
      <li v-if="regionale"><AccueilTuile :to="regionale.to" :drapeau="regionale.code" :titre="regionale.titre" :couleur="regionale.couleur" /></li>
      <li><AccueilTuile to="/programme" :emoji="EMOJI_ACCUEIL.programme" :titre="t('accueil.tuile.programme')" couleur="#9b59b6"
        :description="enseignant ? t('accueil.programmeDescEnseignant') : t('accueil.programmeDesc', { classes: classesTexte })" /></li>
      <li><AccueilTuile to="/telechargements" :emoji="EMOJI_ACCUEIL.fiches" :titre="t('accueil.tuile.fiches')" couleur="#e91e8c" :description="t('accueil.fichesDesc')" /></li>
    </ul>
    <AccueilReprendre />
  </div>
</template>

<script setup lang="ts">
// Accueil du parent (une classe, tuiles par matière, « Reprendre », accès au programme et aux fiches toutes prêtes) et de
// l'enseignant (plusieurs classes, entrée Programme décrite comme son outil, « Copier le lien pour les familles »).
import { computed } from 'vue'
import { useContexte } from '../contexte/useContexte.ts'
import { EMOJI_ACCUEIL } from '../ressources/composants/presentation.ts'
import AccueilClasses from './AccueilClasses.vue'
import AccueilCopierLien from './AccueilCopierLien.vue'
import AccueilReprendre from './AccueilReprendre.vue'
import AccueilTuile from './AccueilTuile.vue'
import { useTuilesAccueil } from './useTuilesAccueil.ts'

const { tuiles, regionale, classesTexte, t } = useTuilesAccueil()
const { contexte } = useContexte()
const enseignant = computed(() => contexte.value.profil === 'enseignant')
</script>

<style scoped>
.entete { text-align: center; padding: 1.5rem 0 1.25rem; }
h1 { font-size: 2.2rem; font-weight: 900; color: var(--bleu-fort); margin-bottom: .4rem; }
.sous-titre { font-size: 1.1rem; color: var(--texte-doux); max-width: 560px; margin: 0 auto 1.2rem; }
.tuiles { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
</style>
