<template>
  <!--
    Tableau de correction commun de l'écran de fin (dans <ResultatsJeu>) : une ligne par entrée de l'historique de
    useJeu — question, réponse donnée (`donne`, rangée par jeu.repondre(rep, { donne })), bonne réponse, ✅ / ❌.
      <TableauCorrection :historique="historique" />
      <TableauCorrection :historique="historique"><template #question="{ entree }">dessin + texte</template></TableauCorrection>
    Par défaut, la question est `question.texte` et la bonne réponse `question.attendu`.
  -->
  <table class="correction-table">
    <thead><tr><th>{{ t('colQuestion') }}</th><th>{{ t('taReponse') }}</th><th>{{ t('bonneReponse') }}</th><th></th></tr></thead>
    <tbody>
      <tr v-for="(h, i) in historique" :key="i" :class="etatDe(h)">
        <td><slot name="question" :entree="h">{{ h.question.texte }}</slot></td>
        <td>{{ h.donne }}</td>
        <td class="mot-attendu"><slot name="attendu" :entree="h">{{ h.question.attendu }}</slot></td>
        <td>{{ h.ok ? '✅' : '❌' }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts" generic="Q extends { texte?: unknown, attendu?: unknown }">
// textes : catalogue commun (colQuestion, taReponse, bonneReponse)
import { useI18n } from '../i18n'
import { etatDe } from './useJeu.ts'
import type { EntreeHistorique } from './useJeu.ts'

// Q : une question ; par défaut, `question.texte` et `question.attendu` sont affichés (ou les slots)
defineProps<{
  // jeu.historique : [{ question, ok, nuance, donne, … }]
  historique: readonly EntreeHistorique<Q, unknown>[]
}>()
defineSlots<{
  question?(props: { entree: EntreeHistorique<Q, unknown> }): unknown
  attendu?(props: { entree: EntreeHistorique<Q, unknown> }): unknown
}>()
const { t } = useI18n()
</script>
