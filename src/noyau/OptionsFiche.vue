<!--
  Bloc « Sur la fiche » : options communes à toutes les fiches d'exercice du noyau (optionsFiche.ts, dernier choix
  mémorisé) — ligne « Prénom et date », corrigé (sans / sur une autre page / en bas à l'envers) et police de la fiche.
  Affiché par CadreExercice en mode impression. Le slot ajoute des boutons à côté de « Prénom et date ».
  `police` : false pour un exercice sans texte à mettre en police (pas de choix de police).
  Accessibilité : groupe nommé par son titre ; chaque bouton de choix porte `aria-pressed`.
-->
<template>
  <div class="config-section options-fiche" role="group" :aria-labelledby="idTitre">
    <div :id="idTitre" class="config-section-title">{{ t('cadre.surLaFiche') }}</div>
    <div class="btn-group">
      <button type="button" class="level-btn" :class="{ active: options.entete }" :aria-pressed="options.entete" @click="options.entete = !options.entete">
        <span v-if="options.entete" aria-hidden="true">✓ </span>{{ t('cadre.entete') }}
      </button>
      <slot />
    </div>
    <div v-if="avecCorrige" class="btn-group" role="group" :aria-label="t('communs.corrige')">
      <button v-for="c in CHOIX_CORRIGE" :key="c" type="button" class="level-btn" :class="{ active: options.corrige === c }"
        :aria-pressed="options.corrige === c" @click="options.corrige = c">{{ t(`cadre.corrige_${c}`) }}</button>
    </div>
    <ChoixPolice v-if="police" class="police-fiche" />
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import ChoixPolice from './ChoixPolice.vue'
import { useOptionsFiche, CHOIX_CORRIGE } from './optionsFiche.ts'
import { useLangue } from '../langues/useLangue.ts'

withDefaults(defineProps<{
  // la fiche a un corrigé → choix « sans / sur une autre page / en bas à l'envers »
  avecCorrige?: boolean
  // le choix de la police est proposé
  police?: boolean
}>(), { avecCorrige: true, police: true })
defineSlots<{ default?(): unknown }>()

const { t } = useLangue()
const idTitre = useId()
const options = useOptionsFiche()
</script>
