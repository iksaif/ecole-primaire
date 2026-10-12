<!--
  Retour après une réponse (« Bravo ! », « La réponse est 12 »…) : une zone de statut annoncée aux lecteurs d'écran
  (aria-live poli). La zone est toujours dans la page, vide avant la réponse : c'est le changement de son contenu qui
  est annoncé. `id` permet de la relier au champ (`aria-describedby` de SaisieReponse).
  L'icône du retour (src/images/icones.ts) est dessinée ici, pas écrite dans le message (qui est aussi lu à voix haute) : une
  croix pour une erreur, un panneau pour un « presque », et pour une réussite celle de ce bravo-là (même rang dans la liste
  `communs.bravo` : 🎉 ⭐ 👏 🌟).
    <RetourReponse :message="retour?.message" :etat="etat" id="retour" />
-->
<template>
  <div :id="id || undefined" class="feedback" :class="etat" role="status" aria-live="polite" aria-atomic="true">
    <template v-if="message"><Icone v-if="icone" :nom="icone" /> {{ message }}</template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icone from '../images/Icone.vue'
import type { NomIcone } from '../images/icones.ts'
import { useLangue } from '../langues/useLangue.ts'

const props = withDefaults(defineProps<{
  message?: string
  // '' | 'ok' | 'presque' | 'erreur' (jeu.etat) : la couleur et l'icône
  etat?: string
  id?: string
}>(), { message: '', etat: '', id: '' })

/** L'icône de chaque bravo, au même rang que son texte dans `communs.bravo`. */
const ICONES_BRAVO: readonly NomIcone[] = ['fete', 'etoile', 'applaudissements', 'etoileBrillante']

const { liste } = useLangue()

/** L'icône d'une réussite : celle de son bravo, sinon la fête (un message de réussite propre à l'exercice). */
function iconeDeReussite(message: string): NomIcone {
  const rang = liste('communs.bravo').indexOf(message)
  return ICONES_BRAVO[rang] ?? 'fete'
}

const icone = computed((): NomIcone | null => {
  if (props.etat === 'ok') return iconeDeReussite(props.message)
  if (props.etat === 'presque') return 'attention'
  if (props.etat === 'erreur') return 'croix'
  return null
})
</script>
