<template>
  <!-- pastille « 🧒 / 👨‍👩‍👧 / 🧑‍🏫 » : ouvre le choix du profil (ne change que la disposition, rien n'est verrouillé) -->
  <div ref="racine" class="menu-deroulant" @keydown="touche" @focusout="sortie">
    <button ref="bouton" type="button" class="nbtn" :aria-expanded="ouvert" aria-controls="menu-profil" :aria-label="t('shell.profil.etat', { profil: t(`shell.profil.${contexte.profil}`) })" @click="basculer">
      <span aria-hidden="true">{{ EMOJI_PROFIL[contexte.profil] }}</span><span class="nom-profil" :class="{ long: nomProfil.length > 7 }" aria-hidden="true">{{ nomProfil }}</span><span aria-hidden="true">▾</span>
    </button>
    <div v-if="ouvert" id="menu-profil" class="menu-panneau">
      <h3>{{ t('shell.profil.question') }}</h3>
      <OptionsProfil @choisi="fermer(true)" />
      <p class="note">{{ t('shell.profil.note') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useContexte } from '../contexte/useContexte.ts'
import { useLangue } from '../langues/useLangue.ts'
import OptionsProfil from './OptionsProfil.vue'
import { EMOJI_PROFIL } from './emojis.ts'
import { useMenu } from './menus.ts'

const { t } = useLangue()
const { contexte } = useContexte()
const nomProfil = computed(() => t(`shell.profil.${contexte.value.profil}`))
const { racine, bouton, ouvert, fermer, basculer, touche, sortie } = useMenu('profil')
</script>

<style scoped>
/* le nom du profil est visible quand il y a la place : au téléphone jamais, et sous 1440 px quand il est long (« Enseignant » : la barre de l'enseignant
   a aussi l'entrée « Programme », et des polices plus larges la font déborder à 1280 px) */
@media (max-width: 900px) { .nom-profil { display: none; } }
@media (max-width: 1440px) { .nom-profil.long { display: none; } }
</style>
