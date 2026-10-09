<template>
  <p class="profil">
    {{ t('accueil.profil.phrase') }}
    <template v-for="(p, i) in proposes" :key="p">
      <span v-if="i" aria-hidden="true"> · </span>
      <button type="button" class="choix" :class="{ actuel: contexte.profil === p }" :aria-pressed="contexte.profil === p" @click="choisirProfil(p)">
        <span aria-hidden="true">{{ EMOJI_PROFIL[p] }}</span> {{ t(`accueil.profil.${p}`) }}
      </button>
    </template>
    <span class="facultatif">{{ t('accueil.profil.facultatif') }}</span>
  </p>
</template>

<script setup lang="ts">
// Le choix du profil, proposé en bas de l'accueil, facultatif (jamais bloquant, jamais sur une page ouverte par un lien) :
// « Vous êtes plutôt : enfant · parent · enseignant ? ». Il ne change que la disposition (contexte : choisirProfil).
import { useContexte } from '../contexte/useContexte.ts'
import { computed } from 'vue'
import { profilsProposes } from '../contexte/regles.ts'
import { modeEnseignantActif } from '../contexte/enseignant.ts'
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI_PROFIL } from '../shell/emojis.ts'

const { t } = useLangue()
const { contexte, choisirProfil } = useContexte()
const proposes = computed(() => profilsProposes(modeEnseignantActif.value))
</script>

<style scoped>
.profil { text-align: center; margin-top: 2rem; color: var(--texte-doux); }
.choix { border: none; background: none; font: inherit; color: var(--bleu-fort); text-decoration: underline; cursor: pointer; padding: .6rem .3rem; min-height: 2.75rem; }
.choix.actuel { color: var(--texte); font-weight: 800; text-decoration: none; }
.facultatif { display: block; font-size: .85rem; }
</style>
