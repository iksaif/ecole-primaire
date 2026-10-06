<template>
  <!--
    Bloc « Sur la fiche » : options communes à toutes les fiches d'exercice du noyau (optionsFiche.ts, dernier choix
    mémorisé) — ligne « Prénom et date », corrigé (sans / sur une autre page / en bas à l'envers) et police de la fiche.
    Affiché par CadreExercice en mode impression. Le slot ajoute des boutons à côté de « Prénom et date ».
  -->
  <div class="config-section options-fiche">
    <div class="config-section-title">{{ t('cadre.surLaFiche') }}</div>
    <div class="btn-group">
      <button class="level-btn" :class="{ active: options.entete }" @click="options.entete = !options.entete">
        {{ options.entete ? '✓ ' : '' }}{{ t('cadre.entete') }}
      </button>
      <slot />
    </div>
    <div v-if="avecCorrige" class="btn-group">
      <button v-for="c in CHOIX_CORRIGE" :key="c" class="level-btn" :class="{ active: options.corrige === c }"
        @click="options.corrige = c">{{ t(`cadre.corrige_${c}`) }}</button>
    </div>
    <ChoixPolice class="police-fiche" />
  </div>
</template>

<script setup lang="ts">
import ChoixPolice from './ChoixPolice.vue'
import { useOptionsFiche, CHOIX_CORRIGE } from './optionsFiche.ts'
import { useLangue } from '../langues/useLangue.ts'

withDefaults(defineProps<{
  // la fiche a un corrigé → choix « sans / sur une autre page / en bas à l'envers »
  avecCorrige?: boolean
}>(), { avecCorrige: true })
defineSlots<{ default?(): unknown }>()

const { t } = useLangue()
const options = useOptionsFiche()
</script>
