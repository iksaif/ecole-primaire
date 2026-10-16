<!--
  Bloc « Présentation de la fiche » (clé cadre.surLaFiche), sous un trait qui le sépare des réglages du contenu, replié par défaut
  (<details> : son titre et le résumé des choix en cours, « Prénom et date · Corrigé sur une autre page · Andika ») : options communes à toutes les fiches d'exercice du noyau (optionsFiche.ts, dernier choix
  mémorisé) — une ligne par préoccupation : « Prénom et date » (CaseReglage, le slot ajoute des boutons à côté), le
  corrigé (sans / sur une autre page / en bas à l'envers : un seul choix, en boutons radio d'une seule pièce), puis la police, les images et
  les pictogrammes des consignes (`pictogrammes` : selon la classe / toujours / jamais, et la ligne de crédit qu'impose leur licence).
  Affiché par CadreExercice en mode impression. `police` : false pour un exercice sans texte à mettre en police ; `images` : true pour
  une fiche qui dessine des emojis avec le rendu reçu (ParamsFiche.images), qui propose alors leur famille et leur style (ChoixImages).
  Accessibilité : éléments natifs (<details> / <summary> pour déplier, case à cocher, radios dans un <fieldset> nommé : flèches du clavier natives), focus visible
  sur le bouton entier, libellés sur une seule ligne, le groupe passe entier à la ligne si l'écran est étroit.
-->
<template>
  <details class="config-section options-fiche">
    <summary>
      <span class="chevron" aria-hidden="true" />
      <span class="config-section-title"><Icone nom="feuille" /> {{ t('cadre.surLaFiche') }}</span>
      <span class="resume">{{ resume }}</span>
    </summary>
    <div class="rang rang-entete">
      <CaseReglage v-model="options.entete" :libelle="t('cadre.entete')" />
      <slot />
    </div>
    <fieldset v-if="avecCorrige" class="rang segmente">
      <legend class="sr-only">{{ t('communs.corrige') }}</legend>
      <label v-for="c in CHOIX_CORRIGE" :key="c" class="pastille" :class="{ choisi: options.corrige === c }">
        <input v-model="options.corrige" type="radio" :name="nomCorrige" :value="c">{{ t(`cadre.corrige_${c}`) }}
      </label>
    </fieldset>
    <ChoixPolice v-if="police" class="police-fiche" icone="police" />
    <ChoixImages v-if="images" />
    <ChoixPictogrammes v-if="pictogrammes" />
    <!-- les choix des extensions actives que l'exercice accepte (src/extensions/) -->
    <component :is="x.composant" v-for="x in composantsExtensions" :key="x.id" />
  </details>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, useId } from 'vue'
import type { Component } from 'vue'
import Icone from '../images/Icone.vue'
import ChoixPolice from './ChoixPolice.vue'
import CaseReglage from './CaseReglage.vue'
import { useOptionsFiche, CHOIX_CORRIGE } from './optionsFiche.ts'
import { usePolices } from './polices.ts'
import ChoixPictogrammes from './ChoixPictogrammes.vue'
import { extensionsActives } from '../extensions/activation.ts'
import { useLangue } from '../langues/useLangue.ts'

// chargé à la demande : ses aperçus tirent les dessins des emojis (src/images/donnees/), inutiles aux fiches sans image
const ChoixImages = defineAsyncComponent(() => import('./ChoixImages.vue'))

const props = withDefaults(defineProps<{
  // la fiche a un corrigé → choix « sans / sur une autre page / en bas à l'envers »
  avecCorrige?: boolean
  // le choix de la police est proposé
  police?: boolean
  // le choix des images (famille, style) est proposé
  images?: boolean
  // le choix des pictogrammes des consignes (selon la classe, toujours, jamais) et de leur ligne de crédit est proposé
  pictogrammes?: boolean
  // les extensions que l'exercice accepte (`extensions` de sa définition) : leurs choix communs sont proposés quand elles sont actives
  extensions?: readonly string[]
}>(), { avecCorrige: true, police: true, images: false, pictogrammes: false, extensions: () => [] })
defineSlots<{ default?(): unknown }>()

const { t } = useLangue()
const nomCorrige = useId()
const options = useOptionsFiche()
const { choix: choixPolice } = usePolices()

// Le bloc replié montre les choix en cours sur une ligne : « Prénom et date · Corrigé sur une autre page · Andika »
const resume = computed(() => {
  const morceaux: string[] = []
  if (options.value.entete) morceaux.push(t('cadre.entete'))
  if (props.avecCorrige) morceaux.push(t(`cadre.corrige_${options.value.corrige}`))
  if (props.police) morceaux.push(choixPolice.value.unique)
  return morceaux.join(' · ')
})

// un composant asynchrone par extension, créé une fois (un nouveau à chaque calcul remonterait le choix)
const parExtension = new Map<string, Component>()
const composantsExtensions = computed(() => extensionsActives.value
  .filter(e => e.optionsFiche && props.extensions.includes(e.id))
  .map(e => {
    if (!parExtension.has(e.id)) parExtension.set(e.id, defineAsyncComponent(e.optionsFiche!))
    return { id: e.id, composant: parExtension.get(e.id)! }
  }))
</script>

<style scoped>
/* la présentation de la fiche, séparée des réglages de son contenu ; repliée, son titre et le résumé des choix */
.options-fiche { border-top: 2px solid var(--gris-brd); padding-top: 1rem; margin-top: .6rem; }
.options-fiche summary { display: flex; flex-wrap: wrap; align-items: baseline; gap: .1rem .75rem; cursor: pointer; padding: .2rem 0; border-radius: 6px; }
/* le triangle du navigateur disparaît avec display: flex : un chevron à la place, qui tourne quand le bloc est déplié */
.options-fiche summary { list-style: none; }
.options-fiche summary::-webkit-details-marker { display: none; }
.chevron {
  display: inline-block; width: .65rem; height: .65rem; margin: 0 .35rem 0 .15rem; align-self: center;
  border-right: 3px solid var(--texte); border-bottom: 3px solid var(--texte); transform: rotate(-45deg); transition: transform .15s;
}
.options-fiche[open] .chevron { transform: rotate(45deg); }
.options-fiche summary:hover .chevron { border-color: var(--bleu-fort); }
.options-fiche summary .config-section-title { display: inline; font-size: 1.1rem; margin: 0; }
.options-fiche summary:hover .config-section-title { color: var(--bleu-fort); }
.options-fiche .resume { font-size: .85rem; font-weight: 600; color: var(--texte-doux); }
.options-fiche[open] .resume { display: none; }
.options-fiche[open] summary { margin-bottom: .75rem; }
.rang { display: flex; flex-wrap: wrap; gap: .5rem; margin: 0 0 .6rem; padding: 0; border: 0; min-width: 0; }
/* le corrigé : un seul groupe d'une pièce (boutons collés), qui passe entier à la ligne si la place manque */
.segmente { gap: 0; width: fit-content; max-width: 100%; border-radius: 22px; }
.pastille {
  position: relative; display: inline-flex; align-items: center; justify-content: center; gap: .3em; white-space: nowrap;
  min-height: 40px; padding: .4rem 1rem; border: 2px solid var(--gris-brd); background: white;
  font-weight: 700; font-size: .85rem; cursor: pointer; border-radius: 22px;
}
.pastille:hover { border-color: var(--bleu); color: var(--bleu-fort); }
.pastille.choisi { background: var(--bleu-fort); border-color: var(--bleu-fort); color: white; }
.pastille input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: pointer; }
.pastille:has(input:focus-visible) { outline: 3px solid var(--bleu-fort); outline-offset: 2px; z-index: 1; }
.segmente .pastille { border-radius: 0; margin-left: -2px; }
.segmente .pastille:first-of-type { border-radius: 22px 0 0 22px; margin-left: 0; }
.segmente .pastille:last-of-type { border-radius: 0 22px 22px 0; }
@media (max-width: 560px) {
  /* écran étroit : les trois boutons s'empilent en pleine largeur, chacun sur une seule ligne */
  .segmente { flex-direction: column; width: 100%; }
  .segmente .pastille, .segmente .pastille:first-of-type, .segmente .pastille:last-of-type { border-radius: 0; margin-left: 0; margin-top: -2px; }
  .segmente .pastille:first-of-type { border-radius: 22px 22px 0 0; margin-top: 0; }
  .segmente .pastille:last-of-type { border-radius: 0 0 22px 22px; }
}
</style>
