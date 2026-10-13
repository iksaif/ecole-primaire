<!-- Le bloc de la fiche sur mesure dans la page des réglages (extension.ts) : un lien vers la page. -->
<template>
  <RouterLink class="btn btn-ghost" to="/assemblage"><Icone nom="fiches" /> {{ t('assemblage.ouvrir') }}</RouterLink>
</template>

<script setup lang="ts">
import Icone from '../images/Icone.vue'
import { useLangue } from '../langues/useLangue.ts'

const { t } = useLangue()
</script>
