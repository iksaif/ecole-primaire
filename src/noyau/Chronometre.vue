<!--
  Temps restant d'une partie chronométrée (Tables : une minute ; Calcul mental : temps par question) : le nombre de
  secondes et une barre qui se vide. Le temps vient de useMinuteur (un seul compte à rebours, arrêté par la vue) ;
  le composant ne fait qu'afficher.
    const minuteur = useMinuteur()
    minuteur.demarrer(60, { surFin: () => jeu.terminer() })
    <Chronometre :restant="minuteur.restant.value" :duree="60" />
  Accessibilité : `role="timer"` (zone de statut sans annonce automatique : un lecteur d'écran ne lit pas chaque seconde) ;
  le nom donne le temps restant en toutes lettres, la barre est décorative. `urgent` : seuil (en secondes) sous lequel
  la barre devient rouge (10 par défaut).
-->
<template>
  <div class="chronometre" role="timer" :aria-label="t('communs.tempsRestant', { n: secondes })">
    <span class="chrono-temps" aria-hidden="true">⏱ {{ secondes }} s</span>
    <div class="timer-bar" aria-hidden="true"><div class="timer-fill" :class="{ urgent: restant <= urgent }" :style="{ width: `${part}%` }"></div></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLangue } from '../langues/useLangue.ts'

const props = withDefaults(defineProps<{
  // secondes restantes (useMinuteur().restant)
  restant: number
  // durée totale, en secondes (la barre est pleine au départ)
  duree: number
  urgent?: number
}>(), { urgent: 10 })
const { t } = useLangue()
const secondes = computed(() => Math.ceil(Math.max(0, props.restant)))
const part = computed(() => (props.duree > 0 ? Math.min(100, Math.max(0, props.restant / props.duree * 100)) : 0))
</script>

<style scoped>
.chronometre { display: flex; align-items: center; gap: .75rem; }
.chrono-temps { font-weight: 800; min-width: 4.5rem; font-variant-numeric: tabular-nums; }
.timer-bar { flex: 1; margin: 0; }
</style>
