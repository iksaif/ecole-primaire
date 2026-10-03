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

    <div v-if="mode === 'jouer'" class="actions">
      <button class="btn btn-primary btn-grand" :disabled="desactive" @click="$emit('commencer')">{{ t('commencer') }}</button>
    </div>
    <ApercuImpression v-else :html="fiche" :nb-pages="nbPages" :fluide="fluide" :reglages="config">
      <template #actions>
        <button v-if="aleatoire" class="btn btn-ghost" @click="$emit('regenerer')">{{ t('nouvelle') }}</button>
      </template>
    </ApercuImpression>
  </div>
</template>

<script setup>
import ApercuImpression from './ApercuImpression.vue'
import { useI18n } from '../i18n'

defineProps({
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

const { t } = useI18n({
  fr: { jouer: "🎯 Faire l'exercice", imprimer: '🖨️ Imprimer une fiche', nouvelle: '🎲 Nouvelle fiche' },
  br: { jouer: '🎯 Ober ar boelladenn', imprimer: '🖨️ Moullañ ur fichenn', nouvelle: '🎲 Fichenn nevez' },
})
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
.actions { text-align: center; margin-top: 1.5rem; }
.btn-grand { font-size: 1.1rem; padding: .75rem 2rem; }
</style>
