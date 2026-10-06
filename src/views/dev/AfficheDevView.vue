<template>
  <!-- Dev seulement (route /dev/affiches, atteinte sous import.meta.env.DEV) : une affiche d'exemple et son formulaire.
       Le modèle de la future page des affiches : choisir une affiche du registre, puis <FormulaireAffiche>. -->
  <div class="container">
    <h1 class="section-heading">{{ t('dev.afficheDevTitre') }}</h1>
    <p class="intro">{{ t('dev.afficheDevIntro') }}</p>
    <div class="btn-group">
      <router-link v-for="a in modules" :key="a.definition.id" class="level-btn"
        :class="{ active: a.definition.id === courant?.definition.id }" :to="{ path: '/dev/affiches', query: { affiche: a.definition.id } }">{{ a.definition.id }}</router-link>
    </div>
    <FormulaireAffiche v-if="courant" :key="courant.definition.id + route.fullPath" :module="courant" :depart="depart" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLangue } from '../../langues/useLangue.ts'
import FormulaireAffiche from '../../noyau/FormulaireAffiche.vue'
import { REGISTRE } from '../../affiches/index.ts'
import type { ModuleAffiche } from '../../affiches/types.ts'

const { t } = useLangue()
const route = useRoute()
const modules = ref<ModuleAffiche[]>([...REGISTRE])
// import dynamique : le module d'exemples n'entre pas dans le build de production
import('../../affiches/exemples.ts').then(m => { modules.value = [...REGISTRE, ...m.EXEMPLES] })
const courant = computed(() => modules.value.find(a => a.definition.id === route.query.affiche) ?? modules.value[0])
const texte = (q: unknown): string | undefined => (typeof q === 'string' ? q : undefined)
const depart = computed(() => Object.fromEntries(
  (['variante', 'langue'] as const).flatMap(cle => { const v = texte(route.query[cle]); return v ? [[cle, v]] : [] })))
</script>

<style scoped>
.intro { color: #666; margin: -.5rem 0 1rem; }
</style>
