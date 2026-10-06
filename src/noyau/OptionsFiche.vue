<!--
  Bloc « Sur la fiche » : options communes à toutes les fiches d'exercice du noyau (optionsFiche.ts, dernier choix
  mémorisé) — une ligne par préoccupation : « Prénom et date » (case à cocher, le slot ajoute des boutons à côté), le
  corrigé (sans / sur une autre page / en bas à l'envers : un seul choix, en boutons radio d'une seule pièce), puis la police.
  Affiché par CadreExercice en mode impression. `police` : false pour un exercice sans texte à mettre en police.
  Accessibilité : éléments natifs (case à cocher, radios dans un <fieldset> nommé : flèches du clavier natives), focus visible
  sur le bouton entier, libellés sur une seule ligne, le groupe passe entier à la ligne si l'écran est étroit.
-->
<template>
  <div class="config-section options-fiche" role="group" :aria-labelledby="idTitre">
    <div :id="idTitre" class="config-section-title">{{ t('cadre.surLaFiche') }}</div>
    <div class="rang rang-entete">
      <label class="pastille" :class="{ choisi: options.entete }">
        <input v-model="options.entete" type="checkbox">
        <span aria-hidden="true">{{ options.entete ? '✓ ' : '' }}</span>{{ t('cadre.entete') }}
      </label>
      <slot />
    </div>
    <fieldset v-if="avecCorrige" class="rang segmente">
      <legend class="sr-only">{{ t('communs.corrige') }}</legend>
      <label v-for="c in CHOIX_CORRIGE" :key="c" class="pastille" :class="{ choisi: options.corrige === c }">
        <input v-model="options.corrige" type="radio" :name="nomCorrige" :value="c">{{ t(`cadre.corrige_${c}`) }}
      </label>
    </fieldset>
    <ChoixPolice v-if="police" class="police-fiche" />
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import ChoixPolice from './ChoixPolice.vue'
import { useOptionsFiche, CHOIX_CORRIGE } from './optionsFiche.ts'
import { useLangue } from '../langues/useLangue.ts'

withDefaults(defineProps<{
  // la fiche a un corrigé → choix « sans / sur une autre page / en bas à l'envers »
  avecCorrige?: boolean
  // le choix de la police est proposé
  police?: boolean
}>(), { avecCorrige: true, police: true })
defineSlots<{ default?(): unknown }>()

const { t } = useLangue()
const idTitre = useId()
const nomCorrige = useId()
const options = useOptionsFiche()
</script>

<style scoped>
.rang { display: flex; flex-wrap: wrap; gap: .5rem; margin: 0 0 .6rem; padding: 0; border: 0; min-width: 0; }
/* le corrigé : un seul groupe d'une pièce (boutons collés), qui passe entier à la ligne si la place manque */
.segmente { gap: 0; width: fit-content; max-width: 100%; border-radius: 22px; }
.pastille {
  position: relative; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap;
  min-height: 44px; padding: .4rem 1rem; border: 2px solid var(--gris-brd); background: white;
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
