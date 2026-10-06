<template>
  <div role="group" :aria-label="t('shell.profil.titre')">
    <button v-for="p in PROFILS" :key="p" type="button" class="option" :aria-pressed="contexte.profil === p" @click="choisir(p)">
      <span class="icone" aria-hidden="true">{{ EMOJI_PROFIL[p] }}</span>
      <span><strong>{{ t(`shell.profil.${p}`) }}</strong><small>{{ t(`shell.profil.${p}Desc`) }}</small></span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useContexte } from '../contexte/useContexte.ts'
import { PROFILS } from '../contexte/types.ts'
import type { Profil } from '../contexte/types.ts'
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI_PROFIL } from './emojis.ts'

const emit = defineEmits<{ choisi: [] }>()
const { t } = useLangue()
const { contexte, choisirProfil } = useContexte()
const choisir = (p: Profil): void => { choisirProfil(p); emit('choisi') }
</script>
