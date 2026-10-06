<template>
  <!-- Choix de la présentation de la liste (cartes ▦ ou liste ☰) : le contexte la garde dans l'adresse (`vue=liste`). -->
  <div class="vue" role="group" :aria-label="t('fichesPretes.vue.titre')">
    <button v-for="v in VUES" :key="v" type="button" :aria-pressed="contexte.vue === v" @click="choisirVue(v)">
      <span aria-hidden="true">{{ v === 'cartes' ? '▦' : '☰' }}</span> {{ t(v === 'cartes' ? 'fichesPretes.vue.cartes' : 'fichesPretes.vue.liste') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useContexte } from '../contexte/useContexte.ts'
import { VUES } from '../contexte/types.ts'
import { useLangue } from '../langues/useLangue.ts'

const { t } = useLangue()
const { contexte, choisirVue } = useContexte()
</script>

<style scoped>
.vue { display: inline-flex; border: 2px solid var(--gris-brd); border-radius: 22px; overflow: hidden; background: white; }
button { min-height: 44px; padding: .3rem 1rem; border: 0; background: white; font-weight: 700; color: var(--texte); }
button[aria-pressed="true"] { background: var(--bleu-fort); color: white; }
</style>
