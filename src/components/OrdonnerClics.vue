<template>
  <!--
    Ranger par clics successifs (pas de glisser-déposer) : l'élève touche les éléments dans l'ordre voulu ; ils
    s'alignent dans les cases de la réponse. Utilisé par Ordonner, Longueurs, Vocabulaire, Grammaire, Numération.
      <OrdonnerClics v-model="ordre" :elements="q.nombres" :verrou="repondu" :etat="etat" @valider="valider">
        <template #element="{ element }">{{ element }}</template>
      </OrdonnerClics>
    - v-model : les INDICES des éléments touchés, dans l'ordre des clics (pas leurs valeurs : deux mots peuvent être
      égaux). `ordre.map(i => elements[i])` donne la réponse à passer à jeu.repondre.
    - elements : ce qu'on range, en désordre ; verrou : plus de clic (question répondue) ; etat : '' | 'ok' | 'erreur'
      (jeu.etat) colore la zone de réponse.
    - slots : #element="{ element, index, rang }" contenu d'un bouton (rang : position dans la réponse, -1 si pas
      touché) ; #place="{ element, index, rang }" contenu d'une case de la réponse (par défaut, celui de #element) ;
      le slot par défaut s'affiche entre la réponse et les boutons (flèche d'aide « du plus petit au plus grand »).
    - props de forme : separateur (texte entre deux cases, ex. « → ») ; sansZone (pas de cases : le rang est montré
      dans le bouton, voir #element) ; sansBouton (pas de Valider : l'appelant valide seul quand `complet`).
    - événement valider : clic sur « Valider » (actif quand tous les éléments sont placés). « Annuler » retire le
      dernier élément. Textes : catalogue commun (annuler, valider). La vue vide `ordre` à chaque nouvelle question
      (surQuestion de useJeu) ; elements doit garder la même identité d'un rendu à l'autre (ex. q.nombres).
  -->
  <div class="ordre-clics">
    <div v-if="!sansZone" class="ordre-zone" :class="etat" aria-live="polite">
      <template v-for="(_, k) in elements" :key="k">
        <span v-if="separateur && k > 0" class="ordre-sep">{{ separateur }}</span>
        <span class="ordre-slot" :class="[ordre[k] !== undefined ? 'rempli' : 'vide', etat]">
          <slot v-if="ordre[k] !== undefined" name="place" :element="elements[ordre[k]]" :index="ordre[k]" :rang="k">
            <slot name="element" :element="elements[ordre[k]]" :index="ordre[k]" :rang="k">{{ elements[ordre[k]] }}</slot>
          </slot>
          <template v-else>_</template>
        </span>
      </template>
    </div>

    <slot />

    <div class="ordre-grille">
      <button v-for="(e, i) in elements" :key="i" type="button" class="ordre-btn" :class="{ pris: ordre.includes(i) }"
        :disabled="verrou || ordre.includes(i)" @click="choisir(i)">
        <slot name="element" :element="e" :index="i" :rang="ordre.indexOf(i)">{{ e }}</slot>
      </button>
    </div>

    <div class="ordre-actions">
      <button type="button" class="btn btn-ghost" :disabled="verrou || !ordre.length" @click="annuler">{{ t('annuler') }}</button>
      <button v-if="!sansBouton" type="button" class="btn btn-primary" :disabled="verrou || !complet" @click="$emit('valider')">{{ t('valider') }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from '../i18n'

const props = defineProps({
  modelValue: { type: Array, required: true },
  elements: { type: Array, required: true },
  verrou: { type: Boolean, default: false },
  etat: { type: String, default: '' },
  separateur: { type: String, default: '' },
  sansZone: { type: Boolean, default: false },
  sansBouton: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'valider'])
const { t } = useI18n()

const ordre = computed(() => props.modelValue)
const complet = computed(() => ordre.value.length >= props.elements.length)

function choisir(i) {
  if (props.verrou || ordre.value.includes(i)) return
  emit('update:modelValue', [...ordre.value, i])
}
const annuler = () => emit('update:modelValue', ordre.value.slice(0, -1))
</script>

<style scoped>
.ordre-clics { text-align: center; }
.ordre-zone { display: flex; gap: .75rem; justify-content: center; align-items: center; margin-bottom: .5rem; flex-wrap: wrap; }
.ordre-sep { color: #aaa; font-weight: 700; }
.ordre-slot {
  width: 4rem; height: 4rem; border-radius: 12px; display: flex; align-items: center; justify-content: center;
  font-size: 2rem; font-weight: 900; border: 3px solid var(--gris-brd);
}
.ordre-slot.vide { color: #ccc; border-style: dashed; }
.ordre-slot.rempli { border-color: var(--bleu); background: #eef5ff; color: var(--bleu); }
.ordre-slot.ok { border-color: var(--vert); background: #f0faf0; color: var(--vert); }
.ordre-slot.erreur { border-color: var(--rouge); background: #fef0f0; color: var(--rouge); }

.ordre-grille { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin: 1.25rem 0; }
.ordre-btn {
  min-width: 4.5rem; min-height: 4.5rem; font: inherit; font-size: 2.2rem; font-weight: 900; border-radius: 50%;
  border: 4px solid var(--orange); background: white; color: var(--orange); cursor: pointer; transition: all .15s;
}
.ordre-btn:hover:not(:disabled) { background: #fff5e0; transform: scale(1.08); }
.ordre-btn.pris { opacity: .3; cursor: default; }
.ordre-btn:disabled:not(.pris) { cursor: default; }

.ordre-actions { display: flex; gap: .75rem; justify-content: center; margin-bottom: .75rem; }
</style>
