<!-- Le bloc des ceintures dans la page des réglages (extension.ts) : le choix commun, en version complète (seuil, questions, chronomètre), et le lien du brevet sur mesure. -->
<template>
  <ChoixCeintures complet />
  <p class="lien"><RouterLink class="btn btn-ghost" to="/ceintures/brevet"><Icone nom="trophee" /> {{ t('ceintures.surMesure.lien') }}</RouterLink></p>
</template>

<script setup lang="ts">
import Icone from '../images/Icone.vue'
import { useLangue } from '../langues/useLangue.ts'
import ChoixCeintures from './ChoixCeintures.vue'

const { t } = useLangue()
</script>

<style scoped>
.lien { margin: 1rem 0 0; }
</style>
