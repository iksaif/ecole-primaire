<template>
  <div class="vue" role="group" :aria-label="t('ressource.vue.titre')">
    <button v-for="v in VUES" :key="v" type="button" :aria-pressed="contexte.vue === v" :class="{ actif: contexte.vue === v }" @click="choisirVue(v)">
      <span aria-hidden="true">{{ EMOJI_VUE[v] }}</span> {{ t(`ressource.vue.${v}`) }}
    </button>
  </div>
</template>

<script setup lang="ts">
// Cartes ▦ / Liste ☰ : deux boutons à bascule, dans l'adresse (`?vue=`) et sur l'appareil, par le contexte (choisirVue).
import { useContexte } from '../../contexte/useContexte.ts'
import { VUES } from '../../contexte/types.ts'
import { useLangue } from '../../langues/useLangue.ts'
import { EMOJI_VUE } from './presentation.ts'

const { t } = useLangue()
const { contexte, choisirVue } = useContexte()
</script>

<style scoped>
.vue { display: inline-flex; background: white; border-radius: 999px; box-shadow: var(--shadow); padding: 3px; }
button { border: none; background: none; border-radius: 999px; padding: .4rem .9rem; min-height: 2.25rem; font: inherit; font-weight: 700; font-size: .9rem; color: var(--texte); cursor: pointer; }
button.actif { background: var(--bleu-fort); color: white; }
</style>
