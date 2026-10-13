<!--
  L'onglet « Ceintures » de la page d'un exercice qui a une piste (extension.ts) : le brevet papier de cette piste, dans le cadre de la page. `exercice` : l'identifiant de l'exercice
  (`EXERCICES_AVEC_BREVET` : les tables de multiplication et le calcul mental) ; la piste est celle de l'exercice. Le brevet garde ses propres réglages (classe, ceinture, tables) : ils ne suivent pas ceux de l'exercice.
-->
<template>
  <section class="onglet-ceintures">
    <p class="intro">{{ t('ceintures.ongletIntro') }}</p>
    <BrevetPapier imbrique :piste="EXERCICES_AVEC_BREVET[exercice]" />
  </section>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'
import BrevetPapier from './BrevetPapier.vue'
import { EXERCICES_AVEC_BREVET } from './brevets.ts'

defineProps<{ exercice: string }>()
const { t } = useLangue()
</script>

<style scoped>
.intro { color: var(--texte-doux); margin: 0 0 1rem; font-size: .95rem; }
</style>
