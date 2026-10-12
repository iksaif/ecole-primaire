<!--
  Écran de fin de la maternelle : score, message encourageant et cinq étoiles (au lieu du message du primaire,
  ResultatsJeu). Les confettis viennent de useJeu (watch sur la phase), comme pour ResultatsJeu.
    <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  Étoiles : 5 = sans faute, 4 ≥ 80 %, 3 ≥ 60 %, 2 ≥ 40 %, 1 sinon (le message « on va s'entraîner » commence sous 60 %).
  Accessibilité : comme ResultatsJeu, le score est un titre (h2) qui prend le focus ; les étoiles sont une image nommée.
-->
<template>
  <div class="exercise-box resultats-etoiles">
    <h2 ref="titre" class="result-score" tabindex="-1">
      <span aria-hidden="true">{{ bonnes }} / {{ total }}</span><span class="sr-only">{{ t('communs.scoreSur', { bonnes, total }) }}</span>
    </h2>
    <div class="result-msg">{{ message.texte }} <Icone :nom="message.icone" /></div>
    <div class="etoiles" role="img" :aria-label="t('communs.etoilesSur', { n: etoiles })">
      <span v-for="i in 5" :key="i" aria-hidden="true" :class="{ vide: i > etoiles }"><Icone nom="etoile" /></span>
    </div>
    <div class="btn-group actions">
      <button type="button" class="btn btn-primary" @click="$emit('rejouer')"><Icone nom="rejouer" /> {{ t('communs.rejouer') }}</button>
      <button type="button" class="btn btn-ghost" @click="$emit('reglages')"><Icone nom="reglages" /> {{ t('communs.parametres') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icone from '../images/Icone.vue'
import type { NomIcone } from '../images/icones.ts'
// textes : section `communs` (rejouer, parametres, scoreSur, etoiles5…etoilesSur)
import { ref, computed, onMounted } from 'vue'
import { useLangue } from '../langues/useLangue.ts'

const props = defineProps<{
  bonnes: number
  total: number
}>()
defineEmits<{ rejouer: [], reglages: [] }>()
const { t } = useLangue()
const titre = ref<HTMLElement | null>(null)
onMounted(() => titre.value?.focus({ preventScroll: true }))

const part = computed(() => (props.total ? props.bonnes / props.total : 0))
const etoiles = computed(() => (part.value === 1 ? 5 : part.value >= 0.8 ? 4 : part.value >= 0.6 ? 3 : part.value >= 0.4 ? 2 : 1))
/** Le message encourageant et son icône, selon le nombre d'étoiles. */
const message = computed((): { texte: string, icone: NomIcone } => {
  if (etoiles.value >= 5) return { texte: t('communs.etoiles5'), icone: 'trophee' }
  if (etoiles.value === 4) return { texte: t('communs.etoiles4'), icone: 'etoileBrillante' }
  if (etoiles.value === 3) return { texte: t('communs.etoiles3'), icone: 'muscle' }
  return { texte: t('communs.etoiles0'), icone: 'livres' }
})
</script>

<style scoped>
.resultats-etoiles { text-align: center; }
.etoiles { font-size: 2.5rem; letter-spacing: .2rem; margin: .5rem 0; }
/* une étoile pas gagnée : la même, estompée */
.etoiles .vide { opacity: .25; filter: grayscale(1); }
.actions { justify-content: center; margin-top: 1.5rem; }
</style>
