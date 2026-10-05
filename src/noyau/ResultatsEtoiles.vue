<template>
  <!--
    Écran de fin de la maternelle : score, message encourageant et cinq étoiles (au lieu du message du primaire,
    ResultatsJeu). Les confettis viennent de useJeu (watch sur la phase), comme pour ResultatsJeu.
      <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
        @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
    Étoiles : 5 = sans faute, 4 ≥ 80 %, 3 ≥ 60 %, 2 ≥ 40 %, 1 sinon (le message « on va s'entraîner » commence sous 60 %).
  -->
  <div class="exercise-box resultats-etoiles">
    <div class="result-score" :aria-label="t('scoreSur', { bonnes, total })">{{ bonnes }} / {{ total }}</div>
    <div class="result-msg">{{ message }}</div>
    <div class="etoiles" :aria-label="t('etoilesSur', { n: etoiles })">
      <span v-for="i in 5" :key="i" aria-hidden="true">{{ i <= etoiles ? '⭐' : '☆' }}</span>
    </div>
    <div class="btn-group actions">
      <button class="btn btn-primary" @click="$emit('rejouer')">{{ t('rejouer') }}</button>
      <button class="btn btn-ghost" @click="$emit('reglages')">{{ t('parametres') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// textes : catalogue commun (rejouer, parametres, scoreSur, etoiles5…etoilesSur)
import { computed } from 'vue'
import { useI18n } from '../i18n'

const props = defineProps<{
  bonnes: number
  total: number
}>()
defineEmits<{ rejouer: [], reglages: [] }>()
const { t } = useI18n()

const part = computed(() => (props.total ? props.bonnes / props.total : 0))
const etoiles = computed(() => (part.value === 1 ? 5 : part.value >= 0.8 ? 4 : part.value >= 0.6 ? 3 : part.value >= 0.4 ? 2 : 1))
const message = computed(() => t(etoiles.value >= 3 ? `etoiles${etoiles.value}` : 'etoiles0'))
</script>

<style scoped>
.resultats-etoiles { text-align: center; }
.etoiles { font-size: 2.5rem; letter-spacing: .2rem; margin: .5rem 0; }
.actions { justify-content: center; margin-top: 1.5rem; }
</style>
