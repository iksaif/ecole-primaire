<template>
  <div class="barre">
    <p class="classes">
      <span aria-hidden="true">{{ EMOJI_ACCUEIL.classe }}</span> {{ t('matiere.classe', { n: classes.length }) }} :
      <strong>{{ texteClasses(classes) }}</strong> · {{ t('ressource.ressources', { n: total }) }}
    </p>
    <button type="button" class="toutes" :class="{ actif: toutes }" :aria-pressed="toutes" @click="emit('basculer')">
      <span aria-hidden="true">{{ EMOJI_BARRE.tous }}</span> {{ t('matiere.toutesLesClasses') }}
    </button>
    <SelecteurVue />
  </div>
</template>

<script setup lang="ts">
// La barre de contexte d'une page de matière : « Classe : CE1 · 12 ressources », le bouton « Toutes les classes » (montre les
// ressources de toutes les classes sans changer la classe choisie) et le choix cartes / liste.
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI_BARRE } from '../shell/emojis.ts'
import SelecteurVue from '../ressources/composants/SelecteurVue.vue'
import { texteClasses } from '../data/classes.ts'
import { EMOJI_ACCUEIL } from '../ressources/composants/presentation.ts'
import type { Classe } from '../ressources/types.ts'

defineProps<{ classes: readonly Classe[], total: number, toutes: boolean }>()
const emit = defineEmits<{ basculer: [] }>()
const { t } = useLangue()
</script>

<style scoped>
.barre { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem 1rem; margin-bottom: 1rem; }
.classes { font-size: .95rem; margin-right: auto; }
.toutes { border: 2px solid var(--gris-brd); background: white; border-radius: 999px; min-height: 2.75rem; padding: .3rem .9rem; font: inherit; font-weight: 700; font-size: .9rem; color: var(--texte); cursor: pointer; }
.toutes.actif { background: var(--bleu-fort); border-color: var(--bleu-fort); color: white; }
</style>
