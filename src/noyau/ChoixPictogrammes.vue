<!--
  Les pictogrammes des consignes (src/images/consignes.ts, options de fiche : optionsFiche.ts) : en maternelle seulement (défaut :
  l'élève ne lit pas encore), toujours ou jamais ; puis la ligne de crédit qu'impose leur licence (Sergio Palao, ARASAAC), qu'on peut
  retirer en sachant qu'il faut alors citer l'auteur en partageant la fiche. Dans « Sur la fiche » (OptionsFiche), si les consignes de
  l'exercice passent par consignesDe. Le même réglage vaut pour les consignes parlées à l'écran (ConsigneParlee). Accessibilité : comme ChoixImages, des groupes de boutons nommés, l'état dans aria-pressed.
-->
<template>
  <div class="config-section choix-pictogrammes" data-reglage="pictogrammes" role="group" :aria-labelledby="idTitre">
    <div :id="idTitre" class="config-section-title">{{ t('cadre.pictos.titre') }}</div>
    <div class="btn-group" role="group" :aria-labelledby="idTitre">
      <button v-for="c in CHOIX_PICTOGRAMMES" :key="c" type="button" class="level-btn" :data-valeur="c"
        :class="{ active: options.pictogrammes === c }" :aria-pressed="options.pictogrammes === c" @click="options.pictogrammes = c">
        {{ t(`cadre.pictos.${c}`) }}
      </button>
    </div>
    <template v-if="options.pictogrammes !== 'non'">
      <div class="btn-group">
        <button type="button" class="level-btn" data-valeur="mention" :class="{ active: options.mentionPictos }"
          :aria-pressed="options.mentionPictos" @click="options.mentionPictos = !options.mentionPictos">
          {{ t('cadre.pictos.mention') }}
        </button>
      </div>
      <p v-if="!options.mentionPictos" class="note">{{ t('cadre.pictos.avis') }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { CHOIX_PICTOGRAMMES } from '../images/consignes.ts'
import { useOptionsFiche } from './optionsFiche.ts'
import { useLangue } from '../langues/useLangue.ts'

const { t } = useLangue()
const idTitre = useId()
const options = useOptionsFiche()
</script>

<style scoped>
.btn-group + .btn-group { margin-top: .4rem; }
.note { font-size: .85rem; color: var(--texte-doux); margin: .35rem 0 0; }
</style>
