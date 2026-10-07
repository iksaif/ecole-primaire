<template>
  <!-- « 9 fiches pour CE1 » : le nombre de résultats, annoncé aux lecteurs d'écran quand un filtre le change. -->
  <p class="compteur" role="status" aria-live="polite">{{ texte }}</p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { texteClasses } from '../data/classes.ts'
import { useLangue } from '../langues/useLangue.ts'
import type { PageFiches } from '../telechargements/useFichesPage.ts'

const props = defineProps<{ page: PageFiches }>()
const { t } = useLangue()
const texte = computed(() => (props.page.toutes
  ? t('fichesPretes.compteurToutes', { n: props.page.resultats.length })
  : t('fichesPretes.compteurClasses', { n: props.page.resultats.length, classes: texteClasses(props.page.selection) })))
</script>

<style scoped>
.compteur { color: var(--texte-doux); margin: .8rem 0 0; }
</style>
