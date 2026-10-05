<template>
  <!--
    Écran de fin commun des exercices : score, message, détail facultatif (slot), Rejouer et retour aux réglages.
    Usage : <ResultatsJeu v-if="jeu.phase.value === 'resultats'" :bonnes="…" :total="…" :cle-fin="…"
              @rejouer="jeu.recommencer" @reglages="jeu.quitter"> tableau de correction </ResultatsJeu>
    Le message (cleFin) et les confettis viennent de useJeu (watch sur la phase).
  -->
  <div class="exercise-box resultats-jeu">
    <div class="result-score" :aria-label="t('scoreSur', { bonnes, total })">{{ bonnes }} / {{ total }}</div>
    <div v-if="cleFin" class="result-msg">{{ t(cleFin) }}</div>
    <slot />
    <div class="btn-group actions">
      <button class="btn btn-primary" @click="$emit('rejouer')">{{ t('rejouer') }}</button>
      <button class="btn btn-ghost" @click="$emit('reglages')">{{ t('parametres') }}</button>
    </div>
  </div>
</template>

<script setup>
// textes : catalogue commun (resultat100…, rejouer, parametres, scoreSur), partagé avec les vues pas encore migrées
import { useI18n } from '../i18n'

defineProps({
  bonnes: { type: Number, required: true },
  total: { type: Number, required: true },
  // clé du message de fin (resultat100, resultat80…), donnée par useJeu
  cleFin: { type: String, default: '' },
})
defineEmits(['rejouer', 'reglages'])

const { t } = useI18n()
</script>

<style scoped>
.resultats-jeu { text-align: center; }
.actions { justify-content: center; }
</style>
