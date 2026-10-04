<template>
  <!--
    Cadre commun des pages d'exercice :
      - onglets « Faire l'exercice » / « Imprimer une fiche » (si la page sait produire une fiche)
      - le formulaire de réglages (slot par défaut, reçoit { mode }) : un réglage propre à un mode
        s'écrit <div v-if="mode === 'jouer'">…</div>
      - en mode jeu : bouton Commencer ; en mode impression : aperçu en direct, Imprimer et,
        pour les fiches tirées au hasard, « Nouvelle fiche ».
    Usage : <ConfigExercice v-model:mode="mode" :fiche="fiche" @commencer="demarrer" @regenerer="regenerer">
  -->
  <div class="config-box cadre-exercice">
    <div v-if="imprimable" class="modes" role="tablist">
      <button role="tab" :aria-selected="mode === 'jouer'" :class="{ actif: mode === 'jouer' }" @click="$emit('update:mode', 'jouer')">
        {{ t('jouer') }}
      </button>
      <button role="tab" :aria-selected="mode === 'imprimer'" :class="{ actif: mode === 'imprimer' }" @click="$emit('update:mode', 'imprimer')">
        {{ t('imprimer') }}
      </button>
    </div>

    <slot :mode="mode" />

    <!-- options communes à toutes les fiches (useOptionsFiche) -->
    <div v-if="mode === 'imprimer'" class="config-section options-fiche">
      <div class="config-section-title">{{ t('surLaFiche') }}</div>
      <div class="btn-group">
        <button class="level-btn" :class="{ active: options.entete }" @click="options.entete = !options.entete">
          {{ options.entete ? '✓ ' : '' }}{{ t('entete') }}
        </button>
      </div>
      <div v-if="avecCorrige" class="btn-group">
        <button v-for="c in CHOIX_CORRIGE" :key="c" class="level-btn" :class="{ active: options.corrige === c }"
          @click="options.corrige = c">{{ t('corrige_' + c) }}</button>
      </div>
    </div>

    <div class="signalement"><SignalerErreur :reglages="config" /></div>

    <div v-if="mode === 'jouer'" class="actions">
      <button class="btn btn-primary btn-grand" :disabled="desactive" @click="$emit('commencer')">{{ t('commencer') }}</button>
    </div>
    <ApercuImpression v-else :html="ficheFinale" :nb-pages="nbPages" :fluide="fluide" :reglages="reglages">
      <template #actions>
        <button v-if="aleatoire" class="btn btn-ghost" @click="$emit('regenerer')">{{ t('nouvelle') }}</button>
      </template>
    </ApercuImpression>
  </div>
</template>

<script setup>
import ApercuImpression from './ApercuImpression.vue'
import SignalerErreur from './SignalerErreur.vue'
import { computed } from 'vue'
import { useOptionsFiche, appliquerOptionsFiche, aUnCorrige, CHOIX_CORRIGE } from '../composables/useOptionsFiche'
import { useI18n } from '../i18n'
import messagesFr from '../i18n/fr/components/ConfigExercice.js'
import messagesBr from '../i18n/br/components/ConfigExercice.js'

const props = defineProps({
  mode: { type: String, default: 'jouer' },
  // document HTML complet de la fiche (calculé seulement en mode impression)
  fiche: { type: String, default: '' },
  imprimable: { type: Boolean, default: true },
  // fiche tirée au hasard → bouton « Nouvelle fiche »
  aleatoire: { type: Boolean, default: true },
  // document sans pages de taille fixe (fiches « à l'ancienne » qui s'écoulent sur plusieurs pages)
  fluide: { type: Boolean, default: true },
  nbPages: { type: Number, default: 1 },
  desactive: { type: Boolean, default: false },
  // réglages de l'exercice (pour les statistiques d'impression)
  config: { type: Object, default: null },
})
defineEmits(['update:mode', 'commencer', 'regenerer'])

const { t } = useI18n({ fr: messagesFr, br: messagesBr })

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
/* cases à cocher des réglages (ex. corrigé) — :deep car elles viennent du slot */
:deep(.case-corrige) { display: flex; align-items: center; gap: .5rem; margin: .25rem 0 1rem; font-weight: 600; cursor: pointer; }
.options-fiche .btn-group + .btn-group { margin-top: .5rem; }
.signalement { text-align: right; margin: .25rem 0 -.5rem; }
.actions { text-align: center; margin-top: 1.5rem; }
.btn-grand { font-size: 1.1rem; padding: .75rem 2rem; }
</style>
