<template>
  <div role="group" :aria-label="t('shell.profil.titre')">
    <button v-for="p in PROFILS" :key="p" type="button" class="option" :aria-pressed="contexte.profil === p" @click="choisir(p)">
      <span class="icone" aria-hidden="true">{{ EMOJI_PROFIL[p] }}</span>
      <span><strong>{{ t(`shell.profil.${p}`) }}</strong><small>{{ t(`shell.profil.${p}Desc`) }}</small></span>
    </button>
  </div>
</template>

<script setup lang="ts">
// Le choix du profil (pastille de la barre, menu mobile, réglages). Passer à « enfant » change presque tout (classe verrouillée, pages
// simplifiées) : depuis une page quelconque, on revient à l'accueil, sauf là où l'on choisit son profil (accueil, réglages).
import { useRoute, useRouter } from 'vue-router'
import { useContexte } from '../contexte/useContexte.ts'
import { PROFILS } from '../contexte/types.ts'
import type { Profil } from '../contexte/types.ts'
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI_PROFIL } from './emojis.ts'

const emit = defineEmits<{ choisi: [] }>()
const { t } = useLangue()
const { contexte, choisirProfil } = useContexte()
const route = useRoute()
const router = useRouter()
const PAGES_DU_PROFIL = ['/', '/parametres']
function choisir(p: Profil): void {
  const devientEnfant = p === 'enfant' && contexte.value.profil !== 'enfant'
  choisirProfil(p)
  emit('choisi')
  if (devientEnfant && !PAGES_DU_PROFIL.includes(route.path)) void router.push('/')
}
</script>
