<!--
  Cadre commun d'une question d'exercice (avec useJeu) : barre de score (Quitter, « Question n / total », ✅ ❌),
  puis la boîte de l'exercice avec les points de progression et la question (slot).
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu"> rendu de la question </QuestionJeu>
  Accessibilité : la boîte de la question est un groupe nommé « Question n / total » qui reçoit le focus quand la
  question change et que le focus s'est perdu (démarrage, question suivante, élément retiré) ; un champ ou un bouton
  de la question qui a déjà pris le focus (SaisieReponse `focus`) le garde. Le score est lu en toutes lettres.
-->
<template>
  <div class="score-bar">
    <button type="button" class="btn-quitter" @click="jeu.quitter" :title="t('communs.quitterTitre')">{{ t('communs.quitter') }}</button>
    <span>{{ t('communs.question', { n: index + 1, total: questions.length }) }}</span>
    <span role="img" :aria-label="t('communs.scoreSur', { bonnes, total: historique.length })">✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
  </div>

  <div ref="boite" class="exercise-box" role="group" tabindex="-1"
    :aria-label="t('communs.question', { n: index + 1, total: questions.length })">
    <div class="prog-dots" aria-hidden="true">
      <span v-for="(_, i) in questions" :key="i" class="prog-dot"
        :class="[etatDe(historique[i]), { current: i === index }]"></span>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts" generic="Q, Rep">
// textes : section `communs` (quitter, quitterTitre, question) ; points : ok, presque (nuance, orange), erreur
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { etatDe } from './useJeu.ts'
import { useImmersion } from './immersion.ts'
import type { Jeu } from './useJeu.ts'

const props = defineProps<{
  // l'objet rendu par useJeu()
  jeu: Jeu<Q, Rep>
}>()
defineSlots<{ default?(): unknown }>()
const { t } = useLangue()
const { questions, index, bonnes, mauvaises, historique } = props.jeu

// Focus : à l'arrivée et à chaque nouvelle question, si rien n'a le focus (il était sur un bouton disparu), la boîte le prend
const boite = ref<HTMLElement | null>(null)

// Immersion : tant que la question est affichée, l'interface du site s'efface (src/noyau/immersion.ts) ; Échap quitte la partie
useImmersion()
const surTouche = (e: KeyboardEvent): void => { if (e.key === 'Escape' && !e.defaultPrevented) props.jeu.quitter() }
onMounted(() => document.addEventListener('keydown', surTouche))
onUnmounted(() => document.removeEventListener('keydown', surTouche))
const focusPerdu = () => !document.activeElement || document.activeElement === document.body
const rendreLeFocus = () => nextTick(() => { if (focusPerdu()) boite.value?.focus({ preventScroll: true }) })
onMounted(rendreLeFocus)
watch(index, rendreLeFocus, { flush: 'post' })
</script>
