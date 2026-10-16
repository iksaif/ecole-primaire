<!--
  Un réglage oui / non (« Afficher les minutes autour du cadran », « Prénom et date »…) : une vraie case à cocher et son libellé, et
  non un bouton qui ressemble à une valeur d'un choix.
    <CaseReglage v-model="config.aideMinutes" :libelle="t('heure.afficherMinutes')" />
  Accessibilité : <input type="checkbox"> natif dans son <label> (clic sur tout le libellé, espace pour cocher, état lu par les lecteurs
  d'écran), focus visible sur le libellé entier.
-->
<template>
  <label class="case-reglage">
    <input v-model="coche" type="checkbox">
    <span>{{ libelle }}</span>
  </label>
</template>

<script setup lang="ts">
const coche = defineModel<boolean>({ required: true })
defineProps<{ libelle: string }>()
</script>

<style scoped>
.case-reglage {
  display: inline-flex; align-items: center; gap: .55rem; min-height: 40px; padding: .2rem .1rem;
  font-weight: 700; font-size: .9rem; cursor: pointer; border-radius: 8px;
}
.case-reglage input { width: 1.25rem; height: 1.25rem; margin: 0; accent-color: var(--bleu-fort); cursor: pointer; flex: none; }
.case-reglage:hover span { color: var(--bleu-fort); }
.case-reglage:has(input:focus-visible) { outline: 3px solid var(--bleu-fort); outline-offset: 2px; }
.case-reglage input:focus-visible { outline: none; }
</style>
