<!--
  Un groupe de réglages d'un formulaire : titre, aide facultative, contenu. Brique du formulaire d'affiche
  (FormulaireAffiche) ; un formulaire d'exercice peut s'en servir pour ses sous-titres. Même mise en page que ChoixReglage
  (config-section), donc un groupe et un réglage seul s'alignent. Accessibilité : un `role="group"` nommé par son titre.
    <GroupeReglages titre="Contenu" aide="…"> <ChoixReglage …/> … </GroupeReglages>
-->
<template>
  <div class="config-section" role="group" :aria-labelledby="titre ? idTitre : undefined" :data-groupe="id || undefined">
    <div v-if="titre" :id="idTitre" class="config-section-title">{{ titre }}</div>
    <slot />
    <p v-if="aide" class="aide-reglage">{{ aide }}</p>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

withDefaults(defineProps<{ id?: string, titre?: string, aide?: string }>(), { id: '', titre: '', aide: '' })
const idTitre = useId()
</script>

<style scoped>
.aide-reglage { font-size: .85rem; color: var(--texte-doux); margin: .35rem 0 0; }
</style>
