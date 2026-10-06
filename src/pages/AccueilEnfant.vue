<template>
  <div class="enfant">
    <h1>{{ t('accueil.titreEnfant') }}</h1>
    <ul class="tuiles">
      <li v-for="m in tuiles" :key="m.matiere">
        <AccueilTuile :to="m.to" :emoji="m.emoji" :titre="m.titre" :sous="m.sous" :langue-sous="m.langueSous" :couleur="m.couleur" grande />
      </li>
      <li v-if="regionale"><AccueilTuile :to="regionale.to" :drapeau="regionale.code" :titre="regionale.titre" :couleur="regionale.couleur" grande /></li>
    </ul>
    <AccueilReprendre gros />
    <p v-if="verrouillee" class="verrou"><span aria-hidden="true">🔒</span> {{ t('accueil.verrou') }}</p>
  </div>
</template>

<script setup lang="ts">
// Accueil de l'enfant : très grosses tuiles à icônes, peu de texte, la classe verrouillée (un adulte l'ouvre par le cadenas de la barre).
import { useContexte } from '../contexte/useContexte.ts'
import AccueilReprendre from './AccueilReprendre.vue'
import AccueilTuile from './AccueilTuile.vue'
import { useTuilesAccueil } from './useTuilesAccueil.ts'

const { tuiles, regionale, t } = useTuilesAccueil()
const { verrouillee } = useContexte()
</script>

<style scoped>
h1 { text-align: center; font-size: 2.6rem; font-weight: 900; color: var(--bleu-fort); margin: 1rem 0 1.5rem; }
.tuiles { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; }
.verrou { text-align: center; color: var(--texte-doux); margin-top: 1.2rem; }
</style>
