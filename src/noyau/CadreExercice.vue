<template>
  <!--
    Cadre commun des pages d'exercice du noyau :
      - onglets « Faire l'exercice » / « Imprimer une fiche » (le mode est porté par l'URL : useFicheExercice)
      - le formulaire de réglages (slot par défaut, reçoit { mode }) : un réglage propre à un mode
        s'écrit <div v-if="mode === 'jouer'">…</div>
      - en mode jeu : bouton Commencer ; en mode impression : le bloc « Sur la fiche » (prénom et date, corrigé,
        police), l'aperçu en direct, Imprimer et « Nouvelle fiche ».
    Usage : <CadreExercice v-model:mode="mode" :fiche="fiche" :config="config" @commencer="jeu.demarrer" @regenerer="nouvelle">
    Le texte de la fiche est un document HTML complet (documentFiche) ; ses options (prénom et date, corrigé) sont
    appliquées ici (optionsFiche.ts), avant l'aperçu et l'impression.
  -->
  <div class="config-box cadre-exercice">
    <div class="modes" role="tablist">
      <button role="tab" :aria-selected="mode === 'jouer'" :class="{ actif: mode === 'jouer' }" @click="$emit('update:mode', 'jouer')">
        {{ t('jouer') }}
      </button>
      <button role="tab" :aria-selected="mode === 'imprimer'" :class="{ actif: mode === 'imprimer' }" @click="$emit('update:mode', 'imprimer')">
        {{ t('imprimer') }}
      </button>
    </div>

    <slot :mode="mode" />

    <OptionsFiche v-if="mode === 'imprimer'" :avec-corrige="avecCorrige" />

    <div class="signalement"><SignalerErreur :reglages="config ?? undefined" /></div>

    <div v-if="mode === 'jouer'" class="actions">
      <button class="btn btn-primary btn-grand" :disabled="desactive" @click="$emit('commencer')">{{ t('commencer') }}</button>
    </div>
    <ApercuImpression v-else :html="ficheFinale" :fluide="true" :reglages="reglages">
      <template #actions>
        <button class="btn btn-ghost" @click="$emit('regenerer')">{{ t('nouvelle') }}</button>
      </template>
    </ApercuImpression>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ApercuImpression from '../components/ApercuImpression.vue'
import SignalerErreur from '../components/SignalerErreur.vue'
import OptionsFiche from './OptionsFiche.vue'
import { useOptionsFiche, appliquerOptionsFiche, aUnCorrige } from './optionsFiche.ts'
import type { ModeExercice } from './useFicheExercice.ts'
import { useI18n } from '../i18n'
import { TEXTES_CADRE } from './textes.ts'

const props = withDefaults(defineProps<{
  mode: ModeExercice
  // document HTML complet de la fiche (calculé seulement en mode impression)
  fiche?: string
  // réglages de l'exercice (statistiques d'impression, signalement d'erreur)
  config?: Record<string, unknown> | null
  // le bouton « Commencer » est inactif (réglages incomplets)
  desactive?: boolean
}>(), { fiche: '', config: null, desactive: false })
defineEmits<{ 'update:mode': [mode: ModeExercice], commencer: [], regenerer: [] }>()
// le formulaire de réglages reçoit le mode courant
defineSlots<{ default?(props: { mode: ModeExercice }): unknown }>()

const { t } = useI18n(TEXTES_CADRE)

const options = useOptionsFiche()
const avecCorrige = computed(() => aUnCorrige(props.fiche))
const ficheFinale = computed(() => appliquerOptionsFiche(props.fiche, options.value))
const reglages = computed(() => (props.config ? { ...props.config, ...options.value } : options.value))
</script>

<style scoped>
.modes {
  display: flex; gap: .25rem; background: var(--gris-bg); border-radius: 12px; padding: 4px;
  margin: -.5rem 0 1.5rem; width: fit-content; max-width: 100%;
}
.modes button {
  border: none; background: none; border-radius: 9px; padding: .55rem 1.1rem;
  font: inherit; font-weight: 800; font-size: .95rem; color: #666; cursor: pointer;
}
.modes button:hover { color: var(--texte); }
.modes button.actif { background: white; color: var(--texte); box-shadow: 0 1px 4px rgba(0,0,0,.12); }
.signalement { text-align: right; margin: .25rem 0 -.5rem; }
.actions { text-align: center; margin-top: 1.5rem; }
.btn-grand { font-size: 1.1rem; padding: .75rem 2rem; }
</style>
