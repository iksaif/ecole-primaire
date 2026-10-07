<!--
  « Suivant » après une réponse : la partie passe seule à la question suivante (useJeu : délai court après une bonne réponse, plus long
  après une erreur), et le bouton se remplit pendant l'attente pour que ce soit clair ; un clic (ou Entrée) passe tout de suite. Si
  l'exercice attend l'élève (apresErreur: 'attendre'), le bouton est plein et ne bouge pas.
    <BoutonSuivant v-else :jeu="jeu" />
  Accessibilité : un vrai bouton, nommé « Suivant » ; l'animation est coupée si l'utilisateur réduit les animations (le passage
  automatique reste).
-->
<template>
  <button :key="cle" type="button" class="btn btn-primary bouton-suivant" :class="{ attend: !!attente }"
    :style="attente ? { '--duree': `${attente.duree}ms` } : undefined" @click="jeu.suivante">
    <span v-if="attente" class="remplissage" aria-hidden="true"></span>
    <span class="libelle">{{ t('communs.suivant') }}</span>
  </button>
</template>

<script setup lang="ts" generic="Q, Rep">
import { computed } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import type { Jeu } from './useJeu.ts'

const props = defineProps<{ jeu: Jeu<Q, Rep> }>()
const { t } = useLangue()
const attente = computed(() => props.jeu.attente.value)
// une nouvelle attente relance l'animation (nouvel élément)
const cle = computed(() => `${props.jeu.index.value}-${attente.value?.duree ?? 0}`)
</script>

<style scoped>
.bouton-suivant { position: relative; overflow: hidden; isolation: isolate; }
.bouton-suivant.attend { background: var(--bleu-fort); }
.remplissage {
  position: absolute; inset: 0; z-index: -1; background: rgba(255, 255, 255, .28); transform-origin: left center;
  animation: remplir var(--duree) linear forwards;
}
.libelle { position: relative; }
@keyframes remplir { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@media (prefers-reduced-motion: reduce) { .remplissage { animation: none; transform: scaleX(1); opacity: .5; } }
</style>
