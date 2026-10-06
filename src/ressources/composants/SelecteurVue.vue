<template>
  <div class="vue" role="group" :aria-label="t('ressource.vue.titre')">
    <button v-for="v in VUES" :key="v" type="button" :aria-pressed="vue === v" :class="{ actif: vue === v }" @click="choisir(v)">
      <span aria-hidden="true">{{ EMOJI_VUE[v] }}</span> {{ t(`ressource.vue.${v}`) }}
    </button>
  </div>
</template>

<script setup lang="ts">
// Cartes ▦ / Liste ☰ : deux boutons à bascule, dans l'adresse (`?vue=`) et sur l'appareil, par le contexte (choisirVue).
// `vue` : la présentation affichée (peut venir d'un conseil de l'appareil, voir useVueAffichee) ; `choisie` : le lecteur a choisi.
import { useContexte } from '../../contexte/useContexte.ts'
import { VUES } from '../../contexte/types.ts'
import type { Vue } from '../../contexte/types.ts'
import { useLangue } from '../../langues/useLangue.ts'
import { EMOJI_VUE } from './presentation.ts'

defineProps<{ vue: Vue }>()
const emit = defineEmits<{ choisie: [vue: Vue] }>()
const { t } = useLangue()
const { choisirVue } = useContexte()
async function choisir(v: Vue): Promise<void> {
  emit('choisie', v)
  await choisirVue(v)
}
</script>

<style scoped>
.vue { display: inline-flex; background: white; border-radius: 999px; box-shadow: var(--shadow); padding: 3px; }
button { border: none; background: none; border-radius: 999px; padding: .4rem .9rem; min-height: 2.25rem; font: inherit; font-weight: 700; font-size: .9rem; color: var(--texte); cursor: pointer; }
button.actif { background: var(--bleu-fort); color: white; }
</style>
