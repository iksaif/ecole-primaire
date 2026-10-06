<!--
  Retour après une réponse (« Bravo ! », « ❌ La réponse est 12 »…) : une zone de statut annoncée aux lecteurs d'écran
  (aria-live poli). La zone est toujours dans la page, vide avant la réponse : c'est le changement de son contenu qui
  est annoncé. `id` permet de la relier au champ (`aria-describedby` de SaisieReponse).
    <RetourReponse :message="retour?.message" :etat="etat" id="retour" />
-->
<template>
  <div :id="id || undefined" class="feedback" :class="etat" role="status" aria-live="polite" aria-atomic="true">{{ message }}</div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  message?: string
  // '' | 'ok' | 'presque' | 'erreur' (jeu.etat) : la couleur
  etat?: string
  id?: string
}>(), { message: '', etat: '', id: '' })
</script>
