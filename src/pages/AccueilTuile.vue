<template>
  <RouterLink :to="to" class="tuile" :class="{ grande }" :style="{ '--teinte': couleur }">
    <span class="icone" aria-hidden="true"><Drapeau v-if="drapeau" :langue="drapeau" /><template v-else>{{ emoji }}</template></span>
    <span class="titre">{{ titre }}</span>
    <span v-if="sous" class="sous" :lang="langueSous">{{ sous }}</span>
    <span v-if="description" class="description">{{ description }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
// Une tuile de l'accueil : un lien en grande carte (icône, titre, une ligne). `grande` : la disposition enfant (très grosses
// tuiles, peu de texte).
import type { RouteLocationRaw } from 'vue-router'
import type { Langue } from '../langues/registre.ts'
import Drapeau from '../shell/Drapeau.vue'

withDefaults(defineProps<{
  to: RouteLocationRaw
  titre: string
  emoji?: string
  drapeau?: Langue
  description?: string
  /** le nom dans la langue régionale, et son code BCP 47 pour l'attribut `lang` */
  sous?: string | null
  langueSous?: string
  couleur?: string
  grande?: boolean
}>(), { couleur: '#4a90e2' })
</script>

<style scoped>
.tuile {
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: .3rem; text-decoration: none; color: var(--texte);
  background: white; border-radius: var(--radius); box-shadow: var(--shadow); border-top: 4px solid var(--teinte); padding: 1.1rem .8rem; min-height: 9rem; height: 100%;
  transition: transform .15s;
}
.tuile:hover { transform: translateY(-2px); }
.icone { font-size: 2.6rem; line-height: 1.1; }
.titre { font-size: 1.2rem; font-weight: 800; }
.description, .sous { font-size: .9rem; color: var(--texte-doux); }
.grande { border-top: none; border-bottom: 6px solid var(--teinte); border-radius: 24px; padding: 1.6rem 1rem; min-height: 11rem; }
.grande .icone { font-size: 4.2rem; }
.grande .icone :deep(.drapeau) { width: 4.2rem; height: auto; }
.grande .titre { font-size: 1.6rem; }
.grande .sous { font-size: 1.1rem; }
</style>
