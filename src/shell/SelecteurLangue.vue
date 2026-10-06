<template>
  <!-- « Langue ▾ » : les trois modes (français, français + langue régionale, langue régionale seule) ; caché si le site n'en propose qu'un -->
  <div v-if="options.length > 1" ref="racine" class="menu-deroulant" @keydown="touche" @focusout="sortie">
    <button ref="bouton" type="button" class="nbtn" :aria-expanded="ouvert" aria-controls="menu-langue" :aria-label="t('shell.langue.etat', { mode: actuelle?.titre ?? '' })" @click="basculer">
      <span class="icone" aria-hidden="true">{{ EMOJI_BARRE.langue }}</span>
      <span class="drapeaux" aria-hidden="true"><Drapeau v-for="d in actuelle?.drapeaux ?? []" :key="d" :langue="d" /></span>
      <span class="etiquette-large">{{ t('shell.langue.titre') }}</span><span aria-hidden="true">▾</span>
    </button>
    <div v-if="ouvert" id="menu-langue" class="menu-panneau">
      <h3>{{ t('shell.langue.titre') }}</h3>
      <OptionsLangue @choisi="fermer(true)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'
import Drapeau from './Drapeau.vue'
import OptionsLangue from './OptionsLangue.vue'
import { EMOJI_BARRE } from './emojis.ts'
import { useMenu } from './menus.ts'
import { useModesLangue } from './useModesLangue.ts'

const { t } = useLangue()
const { options, actuelle } = useModesLangue()
const { racine, bouton, ouvert, fermer, basculer, touche, sortie } = useMenu('langue')
</script>

<style scoped>
.drapeaux { display: inline-flex; gap: 2px; }
@media (max-width: 1440px) { .etiquette-large { display: none; } }
</style>
