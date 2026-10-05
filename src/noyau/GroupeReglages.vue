<template>
  <!--
    Un groupe de réglages d'un formulaire : titre, aide facultative, contenu. La brique commune aux formulaires du
    noyau (FormulaireAffiche ; un formulaire d'exercice peut s'en servir pour ses sous-titres). Même mise en page que
    ChoixReglage (config-section), donc un groupe et un réglage seul s'alignent.
      <GroupeReglages titre="Contenu" aide="…"> <ChoixReglage …/> … </GroupeReglages>
  -->
  <div class="config-section" :data-groupe="id || undefined">
    <div v-if="titre" class="config-section-title">{{ titre }}</div>
    <slot />
    <p v-if="aide" class="aide-reglage">{{ aide }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ id?: string, titre?: string, aide?: string }>(), { id: '', titre: '', aide: '' })
</script>

<style scoped>
.aide-reglage { font-size: .85rem; color: #777; margin: .35rem 0 0; }
</style>
