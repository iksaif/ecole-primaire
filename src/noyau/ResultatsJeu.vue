<!--
  Écran de fin commun des exercices : score, message, détail facultatif (slot), Rejouer et retour aux réglages.
  Usage : <ResultatsJeu v-if="jeu.phase.value === 'resultats'" :bonnes="…" :total="…" :cle-fin="…"
            @rejouer="jeu.recommencer" @reglages="jeu.quitter"> tableau de correction </ResultatsJeu>
  Le message (cleFin) et les confettis viennent de useJeu (watch sur la phase).
  Accessibilité : le score est un titre (h2) lu en toutes lettres, qui prend le focus à l'affichage de l'écran.
-->
<template>
  <div class="exercise-box resultats-jeu">
    <h2 ref="titre" class="result-score" tabindex="-1">
      <span aria-hidden="true">{{ bonnes }} / {{ total }}</span><span class="sr-only">{{ t('communs.scoreSur', { bonnes, total }) }}</span>
    </h2>
    <div v-if="cleFin" class="result-msg">{{ t(`communs.${cleFin}`) }}</div>
    <slot />
    <div class="btn-group actions">
      <button type="button" class="btn btn-primary" @click="$emit('rejouer')">{{ t('communs.rejouer') }}</button>
      <button type="button" class="btn btn-ghost" @click="$emit('reglages')">{{ t('communs.parametres') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// textes : section `communs` (resultat100…, rejouer, parametres, scoreSur), partagé avec les vues pas encore migrées
import { ref, onMounted } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import type { CleFin } from './useJeu.ts'

withDefaults(defineProps<{
  bonnes: number
  total: number
  // clé du message de fin (resultat100, resultat80…), donnée par useJeu
  cleFin?: CleFin | ''
}>(), { cleFin: '' })
defineEmits<{ rejouer: [], reglages: [] }>()
defineSlots<{ default?(): unknown }>()

const { t } = useLangue()
const titre = ref<HTMLElement | null>(null)
onMounted(() => titre.value?.focus({ preventScroll: true }))
</script>

<style scoped>
.resultats-jeu { text-align: center; }
.actions { justify-content: center; }
</style>
