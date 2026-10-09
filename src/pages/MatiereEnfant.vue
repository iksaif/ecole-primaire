<template>
  <p v-if="!pret" class="chargement" role="status">{{ t('matiere.chargement') }}</p>
  <EtatVide v-else-if="!jeux.length && !affiches.length" :emoji="EMOJI_ACCUEIL.aVenir" :titre="t('matiere.enfantVide')" :texte="t('matiere.enfantVideAide')" />
  <template v-else>
    <ul v-if="jeux.length" class="tuiles">
      <li v-for="r in jeux" :key="r.id">
        <AccueilTuile :to="r.route" :emoji="r.emoji" :titre="texteDe(r.titre, langueAffichee)" :couleur="couleur" grande />
      </li>
    </ul>
    <!-- les affiches de sa classe, plus discrètes : une tuile simple chacune -->
    <template v-if="affiches.length">
      <h2 class="sous-titre"><span aria-hidden="true">🖼️</span> {{ t('matiere.enfantAffiches') }}</h2>
      <ul class="tuiles petites">
        <li v-for="r in affiches" :key="r.id">
          <AccueilTuile :to="r.route" :emoji="r.emoji" :titre="texteDe(r.titre, langueAffichee)" couleur="#f39c12" />
        </li>
      </ul>
    </template>
  </template>
</template>

<script setup lang="ts">
// Page d'une matière pour le profil « enfant » : les exercices qui se jouent à l'écran, de sa classe, en très grosses tuiles, puis ses
// affiches en petites tuiles ; sans domaines, compétences ni fiches (ce qui intéresse l'adulte reste dans la vue complète). Même filtre de
// langue que la page complète (mode du contexte).
import { computed } from 'vue'
import { useContexte } from '../contexte/useContexte.ts'
import { useLangue } from '../langues/useLangue.ts'
import { filtrerParClasses, filtrerParMode } from '../ressources/filtres.ts'
import { texteDe } from '../ressources/textes.ts'
import { useRessources } from '../ressources/useRessources.ts'
import { useAffichable } from '../ressources/useAffichable.ts'
import type { Matiere } from '../data/programme.ts'
import EtatVide from '../ressources/composants/EtatVide.vue'
import { EMOJI_ACCUEIL } from '../ressources/composants/presentation.ts'
import AccueilTuile from './AccueilTuile.vue'

const props = defineProps<{ matiere: Matiere, couleur?: string }>()
const { t, langueAffichee } = useLangue()
const { contexte } = useContexte()
const { pret } = useRessources()
const { affichables: catalogue } = useAffichable()

const deLaMatiere = computed(() => filtrerParClasses(
  filtrerParMode(catalogue.value, contexte.value.mode, contexte.value.regionale).filter(r => r.matiere === props.matiere),
  contexte.value.classes,
))
const jeux = computed(() => deLaMatiere.value.filter(r => r.type === 'exercice' && r.badges.jeu))
const affiches = computed(() => deLaMatiere.value.filter(r => r.type === 'affiche'))
</script>

<style scoped>
.tuiles { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; margin-top: .5rem; }
.tuiles.petites { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: .8rem; }
.sous-titre { font-size: 1.3rem; font-weight: 800; margin: 2rem 0 .6rem; }
.chargement { color: var(--texte-doux); margin: 1rem 0; }
</style>
