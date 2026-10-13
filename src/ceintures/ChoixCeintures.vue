<!--
  Le choix commun des ceintures (src/ceintures/reglages.ts, mémorisé par useCeintures) : la palette (chaque bouton montre ses couleurs), le dessin
  (ruban noué, bandeau, rond) et le noir et blanc (des motifs à la place des couleurs). `complet` : s'y ajoutent le nombre de ceintures, le seuil
  d'un brevet, le nombre de questions et le chronomètre (page des réglages). Sans `complet` : le bloc « Sur la fiche » d'un exercice.
  Accessibilité : groupes de boutons nommés, l'état dans aria-pressed (comme ChoixImages) ; les dessins sont décoratifs, le libellé dit le choix.
-->
<template>
  <div class="config-section choix-ceintures" data-reglage="ceintures" role="group" :aria-labelledby="idTitre">
    <div :id="idTitre" class="config-section-title" :class="{ 'sr-only': complet }">{{ t('ceintures.reglage.titre') }}</div>

    <div class="btn-group" role="group" :aria-label="t('ceintures.reglage.palette')">
      <button v-for="p in IDS_PALETTES" :key="p" type="button" class="level-btn palette" :data-valeur="p"
        :class="{ active: reglages.palette === p }" :aria-pressed="reglages.palette === p" @click="choisirPalette(p)">
        <span class="bandes" aria-hidden="true" v-html="bandes(p)" />{{ t(`ceintures.palette.${p}`) }}
      </button>
    </div>
    <div class="btn-group" role="group" :aria-label="t('ceintures.reglage.style')">
      <button v-for="s in STYLES_CEINTURE" :key="s" type="button" class="level-btn" :data-valeur="s"
        :class="{ active: reglages.style === s }" :aria-pressed="reglages.style === s" @click="reglages.style = s">
        <span class="un" aria-hidden="true" v-html="dessiner(s)" />{{ t(`ceintures.style.${s}`) }}
      </button>
    </div>
    <label class="case"><input v-model="reglages.noirEtBlanc" type="checkbox"> {{ t('ceintures.reglage.noirEtBlanc') }}</label>

    <template v-if="complet">
      <div class="ligne">
        <label :for="`${idTitre}-nb`">{{ t('ceintures.reglage.nb') }}</label>
        <input :id="`${idTitre}-nb`" v-model.number="reglages.nbCeintures" type="range" :min="BORNES.nbCeintures.min" :max="maxCeintures" step="1">
        <output>{{ Math.min(reglages.nbCeintures, maxCeintures) }}</output>
      </div>
      <div class="ligne">
        <label :for="`${idTitre}-seuil`">{{ t('ceintures.reglage.seuil') }}</label>
        <input :id="`${idTitre}-seuil`" v-model.number="reglages.seuil" type="range" :min="BORNES.seuil.min" :max="BORNES.seuil.max" step="5">
        <output>{{ t('ceintures.reglage.seuilValeur', { n: reglages.seuil }) }}</output>
      </div>
      <div class="ligne">
        <label :for="`${idTitre}-questions`">{{ t('ceintures.reglage.questions') }}</label>
        <input :id="`${idTitre}-questions`" v-model.number="reglages.questions" type="range" :min="BORNES.questions.min" :max="BORNES.questions.max" step="1">
        <output>{{ reglages.questions }}</output>
      </div>
      <div class="btn-group" role="group" :aria-label="t('ceintures.reglage.chronometre')">
        <span class="etiquette">{{ t('ceintures.reglage.chronometre') }}</span>
        <button v-for="c in CHRONOMETRES" :key="c" type="button" class="level-btn" :data-valeur="c"
          :class="{ active: reglages.chronometre === c }" :aria-pressed="reglages.chronometre === c" @click="reglages.chronometre = c">
          {{ t(`ceintures.reglage.chrono.${c}`) }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { IDS_PALETTES, PALETTES } from './palettes.ts'
import { BORNES, CHRONOMETRES, STYLES_CEINTURE, avecPalette } from './reglages.ts'
import { ceintureSvg } from './dessin.ts'
import { useCeintures } from './useCeintures.ts'
import type { PaletteId, StyleCeinture } from './types.ts'

defineProps<{ complet?: boolean }>()
const { t } = useLangue()
const idTitre = useId()
const reglages = useCeintures()

/** Choisir une palette : son nombre de ceintures devient le nombre choisi (on peut le baisser avec le curseur). */
const choisirPalette = (p: PaletteId): void => { reglages.value = avecPalette(reglages.value, p) }

// une palette plus courte que le réglage ramène le nombre de ceintures à sa taille
// le nombre choisi est gardé quand on passe à une palette plus courte (il revient avec une palette plus longue) ; ce qui compte est nbCeinturesDe (reglages.ts)
const maxCeintures = computed(() => Math.min(BORNES.nbCeintures.max, PALETTES[reglages.value.palette].couleurs.length))

/** Les couleurs d'une palette, en petites bandes (le bouton se choisit en voyant). */
const bandes = (palette: PaletteId): string => PALETTES[palette].couleurs
  .map(c => ceintureSvg({ couleur: c, style: 'rond', noirEtBlanc: reglages.value.noirEtBlanc, largeur: '1.1rem' })).join('')
/** Une ceinture du premier jaune de la palette choisie, dans le style demandé. */
const dessiner = (style: StyleCeinture): string => ceintureSvg({
  couleur: PALETTES[reglages.value.palette].couleurs[Math.min(2, PALETTES[reglages.value.palette].couleurs.length - 1)],
  style, noirEtBlanc: reglages.value.noirEtBlanc, largeur: '2.6rem',
})
</script>

<style scoped>
.btn-group { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem; }
.btn-group + .btn-group, .btn-group + .case, .case + .ligne, .ligne + .ligne, .ligne + .btn-group { margin-top: .5rem; }
.level-btn { display: inline-flex; align-items: center; gap: .45rem; }
.bandes { display: inline-flex; gap: 1px; }
.case { display: flex; align-items: center; gap: .5rem; font-size: .95rem; cursor: pointer; }
.ligne { display: grid; grid-template-columns: minmax(9rem, 14rem) minmax(8rem, 16rem) auto; align-items: center; gap: .6rem; font-size: .95rem; }
.ligne output { font-weight: 600; }
.etiquette { font-size: .95rem; min-width: 9rem; }
.choix-ceintures { grid-column: 1 / -1; }
</style>
