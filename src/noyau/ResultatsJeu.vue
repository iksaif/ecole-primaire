<template>
  <!--
    Écran de fin commun des exercices : score, message, détail facultatif (slot), Rejouer et retour aux réglages.
    Usage : <ResultatsJeu v-if="jeu.phase.value === 'resultats'" :bonnes="…" :total="…" :cle-fin="…"
              @rejouer="jeu.recommencer" @reglages="jeu.quitter"> tableau de correction </ResultatsJeu>
    Le message (cleFin) et les confettis viennent de useJeu (watch sur la phase).
  -->
  <div class="exercise-box resultats-jeu">
    <div class="result-score" :aria-label="t('communs.scoreSur', { bonnes, total })">{{ bonnes }} / {{ total }}</div>
    <div v-if="cleFin" class="result-msg">{{ t(`communs.${cleFin}`) }}</div>
    <slot />
    <div class="btn-group actions">
      <button class="btn btn-primary" @click="$emit('rejouer')">{{ t('communs.rejouer') }}</button>
      <button class="btn btn-ghost" @click="$emit('reglages')">{{ t('communs.parametres') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// textes : section `communs` (resultat100…, rejouer, parametres, scoreSur), partagé avec les vues pas encore migrées
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
</script>

<style scoped>
.resultats-jeu { text-align: center; }
.actions { justify-content: center; }
</style>
