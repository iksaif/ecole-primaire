<!--
  La page d'une affiche au format « définition » (src/affiches/) : `/imprimer/affiches?affiche=<id>&variante=<v>&langues=fr,br`.
  Le formulaire générique est le même pour toutes les affiches du registre ; ce que porte l'adresse (variante, langues) l'emporte
  sur les réglages mémorisés (lien « Personnaliser » d'une fiche toute prête). Sans `affiche` (ou inconnue) : la première du registre.
-->
<template>
  <div class="container" data-page="affiche">
    <template v-if="courant">
      <h1 class="section-heading">{{ titre }}</h1>
      <FormulaireAffiche :key="courant.definition.id + route.fullPath" :module="courant" :depart="depart" />
    </template>
    <p v-else>{{ t('routeur.introuvable.message') }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import FormulaireAffiche from '../affiches/FormulaireAffiche.vue'
import { REGISTRE } from '../affiches/index.ts'
import { lireLien } from '../affiches/catalogue.ts'
import { traducteurAffiche } from '../affiches/textes.ts'
import { useTitreDePage } from '../router/titres.ts'
import { useLangue } from '../langues/useLangue.ts'

const { t, langue } = useLangue()
const route = useRoute()
const courant = computed(() => REGISTRE.find(a => a.definition.id === route.query.affiche) ?? REGISTRE[0])
const depart = computed(() => lireLien(route.query))
// le titre de l'affiche, dans la langue de l'interface (français si elle n'a pas la traduction)
const titre = computed(() => (courant.value ? traducteurAffiche(courant.value.textes, langue.value)('titre') : ''))
useTitreDePage(() => titre.value)
</script>
