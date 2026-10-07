<!-- Dev seulement (route /dev/affiches, atteinte sous AVEC_DEV : src/dev.ts) : une affiche d'exemple et son formulaire.
  Le modèle de la future page des affiches : choisir une affiche du registre, puis <FormulaireAffiche>. -->
<template>
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
import { AVEC_DEV } from '../../dev.ts'
import FormulaireAffiche from '../../affiches/FormulaireAffiche.vue'
import { REGISTRE } from '../../affiches/index.ts'
import { lireLien } from '../../affiches/catalogue.ts'
import type { ModuleAffiche } from '../../affiches/types.ts'

const { t } = useLangue()
const route = useRoute()
const modules = ref<ModuleAffiche[]>([...REGISTRE])
// import dynamique, seulement en développement (AVEC_DEV) : le module d'exemples n'entre pas dans le build de production
if (AVEC_DEV) import('../../affiches/dev.ts').then(m => { modules.value = [...REGISTRE, ...m.EXEMPLES] })
const courant = computed(() => modules.value.find(a => a.definition.id === route.query.affiche) ?? modules.value[0])
// le lien (?affiche=…&variante=…&langues=fr,br, et les réglages : voir src/pages/AfficheView.vue) ouvre le formulaire sur ces réglages
const depart = computed(() => lireLien(route.query, courant.value?.definition))
</script>

<style scoped>
.intro { color: #666; margin: -.5rem 0 1rem; }
</style>
