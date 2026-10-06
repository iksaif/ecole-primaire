<template>
  <!-- un lien de rubrique : emoji (ou drapeau de la langue régionale) et nom ; allumé sur sa page et celles qui en dépendent -->
  <RouterLink :to="rubrique.chemin" :class="{ 'router-link-active': actif }" :aria-current="actif ? 'page' : undefined">
    <Drapeau v-if="rubrique.langue" :langue="rubrique.langue" />
    <span v-else aria-hidden="true">{{ rubrique.emoji }}</span>
    {{ nom }}
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { LANGUES } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import Drapeau from './Drapeau.vue'
import { rubriqueActive } from './rubriques.ts'
import type { Rubrique } from './rubriques.ts'

const props = defineProps<{ rubrique: Rubrique }>()
const { t } = useLangue()
const route = useRoute()
const actif = computed(() => rubriqueActive(props.rubrique, route.path))
// la langue régionale s'écrit dans elle-même (« Brezhoneg »), jamais dans la langue de l'interface
const nom = computed(() => {
  const { langue, cle } = props.rubrique
  if (langue) { const n = LANGUES[langue].nomLocal; return n.charAt(0).toUpperCase() + n.slice(1) }
  return cle ? t(cle) : ''
})
</script>
