<template>
  <!--
    Options communes à toutes les fiches d'exercice (useOptionsFiche, dernier choix mémorisé) :
    ligne « Prénom et date » et corrigé (sans / sur une autre page / en bas à l'envers).
    Utilisé par ConfigExercice (mode impression) et par les générateurs de « À imprimer » (fiches).
    Usage : <OptionsFiche :avec-corrige="true" /> ; le slot ajoute des boutons à côté de « Prénom et date ».
    avec-police : choix de la police de la fiche (ChoixPolice ; fiches documentFiche, lue par usePoliceFiche).
  -->
  <div class="config-section options-fiche">
    <div class="config-section-title">{{ t('surLaFiche') }}</div>
    <div class="btn-group">
      <button class="level-btn" :class="{ active: options.entete }" @click="options.entete = !options.entete">
        {{ options.entete ? '✓ ' : '' }}{{ t('entete') }}
      </button>
      <!-- options d'en-tête propres à une fiche (ex. score des fiches de calcul) -->
      <slot />
    </div>
    <div v-if="avecCorrige" class="btn-group">
      <button v-for="c in CHOIX_CORRIGE" :key="c" class="level-btn" :class="{ active: options.corrige === c }"
        @click="options.corrige = c">{{ t('corrige_' + c) }}</button>
    </div>
    <ChoixPolice v-if="avecPolice" class="police-fiche" :types="['script']" />
  </div>
</template>

<script setup>
import ChoixPolice from './ChoixPolice.vue'
import { useOptionsFiche, CHOIX_CORRIGE } from '../composables/useOptionsFiche'
import { useI18n } from '../i18n'
import messagesFr from '../i18n/fr/components/OptionsFiche.js'
import messagesBr from '../i18n/br/components/OptionsFiche.js'

defineProps({
  // la fiche a un corrigé → choix « sans / sur une autre page / en bas à l'envers »
  avecCorrige: { type: Boolean, default: true },
  // la fiche suit la police choisie (exercices au format « définition » : documentFiche + usePoliceFiche)
  avecPolice: { type: Boolean, default: false },
})

const { t } = useI18n({ fr: messagesFr, br: messagesBr })
const options = useOptionsFiche()
</script>

<style scoped>
.options-fiche .btn-group + .btn-group { margin-top: .5rem; }
.police-fiche { margin-top: .75rem; }
</style>
