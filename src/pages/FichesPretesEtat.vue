<template>
  <!-- Ce que la page dit quand elle n'a pas de fiches à montrer : chargement, index absent, illisible, ou vide (jamais une page cassée).
       Un message d'état est annoncé aux lecteurs d'écran (role="status" pour l'attente, "alert" pour l'échec). -->
  <p v-if="etat.etat === 'chargement'" class="message" role="status">{{ t('fichesPretes.chargement') }}</p>
  <div v-else-if="etat.etat === 'absent'" class="message" role="alert">
    <p>{{ t('fichesPretes.absent') }}</p>
    <p v-if="dev" class="aide">{{ t('fichesPretes.absentDev') }}</p>
    <button type="button" class="btn btn-ghost" @click="emit('reessayer')">{{ t('fichesPretes.reessayer') }}</button>
  </div>
  <div v-else-if="etat.etat === 'erreur'" class="message" role="alert">
    <p>{{ t('fichesPretes.erreur', { message: etat.message }) }}</p>
    <button type="button" class="btn btn-ghost" @click="emit('reessayer')">{{ t('fichesPretes.reessayer') }}</button>
  </div>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'
import type { EtatChargement } from '../telechargements/chargement.ts'

defineProps<{ etat: EtatChargement<unknown> }>()
const emit = defineEmits<{ reessayer: [] }>()
const { t } = useLangue()
const dev = import.meta.env.DEV
</script>

<style scoped>
.message { color: var(--texte-doux); margin: 2rem 0; display: flex; flex-direction: column; gap: .75rem; align-items: flex-start; }
.aide { font-size: .9rem; }
</style>
