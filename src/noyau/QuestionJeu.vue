<template>
  <!--
    Cadre commun d'une question d'exercice (avec useJeu) : barre de score (Quitter, « Question n / total », ✅ ❌),
    puis la boîte de l'exercice avec les points de progression et la question (slot).
      <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu"> rendu de la question </QuestionJeu>
  -->
  <div class="score-bar">
    <button class="btn-quitter" @click="jeu.quitter" :title="t('quitterTitre')">{{ t('quitter') }}</button>
    <span>{{ t('question', { n: index + 1, total: questions.length }) }}</span>
    <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
  </div>

  <div class="exercise-box">
    <div class="prog-dots">
      <span v-for="(_, i) in questions" :key="i" class="prog-dot"
        :class="[etatDe(historique[i]), { current: i === index }]"></span>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts" generic="Q, Rep">
// textes : catalogue commun (quitter, quitterTitre, question) ; points : ok, presque (nuance, orange), erreur
import { useI18n } from '../i18n'
import { etatDe } from './useJeu.ts'
import type { Jeu } from './useJeu.ts'

const props = defineProps<{
  // l'objet rendu par useJeu()
  jeu: Jeu<Q, Rep>
}>()
defineSlots<{ default?(): unknown }>()
const { t } = useI18n()
const { questions, index, bonnes, mauvaises, historique } = props.jeu
</script>
