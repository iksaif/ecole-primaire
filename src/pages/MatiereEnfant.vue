<template>
  <p v-if="!pret" class="chargement" role="status">{{ t('matiere.chargement') }}</p>
  <EtatVide v-else-if="!jeux.length" :emoji="EMOJI_ACCUEIL.aVenir" :titre="t('matiere.enfantVide')" :texte="t('matiere.enfantVideAide')" />
  <ul v-else class="tuiles">
    <li v-for="r in jeux" :key="r.id">
      <AccueilTuile :to="r.route" :emoji="r.emoji" :titre="texteDe(r.titre, langueAffichee)" :couleur="couleur" grande />
    </li>
  </ul>
</template>

<script setup lang="ts">
// Page d'une matière pour le profil « enfant » : seulement les exercices qui se jouent à l'écran, de sa classe, en très grosses
// tuiles, sans domaines, compétences, affiches ni fiches (ce qui intéresse l'adulte reste dans la vue complète). Même filtre de
// langue que la page complète (mode du contexte).
import { computed } from 'vue'
import { useContexte } from '../contexte/useContexte.ts'
import { useLangue } from '../langues/useLangue.ts'
import { filtrerParClasses, filtrerParMode } from '../ressources/filtres.ts'
import { texteDe } from '../ressources/textes.ts'
import { useRessources } from '../ressources/useRessources.ts'
import type { Matiere } from '../data/programme.ts'
import EtatVide from '../ressources/composants/EtatVide.vue'
import { EMOJI_ACCUEIL } from '../ressources/composants/presentation.ts'
import AccueilTuile from './AccueilTuile.vue'

const props = defineProps<{ matiere: Matiere, couleur?: string }>()
const { t, langueAffichee } = useLangue()
const { contexte } = useContexte()
const { catalogue, pret } = useRessources()

const jeux = computed(() => filtrerParClasses(
  filtrerParMode(catalogue.value, contexte.value.mode, contexte.value.regionale)
    .filter(r => r.type === 'exercice' && r.badges.jeu && r.matiere === props.matiere),
  contexte.value.classes,
))
</script>

<style scoped>
.tuiles { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; margin-top: .5rem; }
.chargement { color: var(--texte-doux); margin: 1rem 0; }
</style>
