<!--
  Ranger par clics successifs (pas de glisser-déposer) : l'élève touche les éléments dans l'ordre voulu ; ils
  s'alignent dans les cases de la réponse. Pour Ordonner, Longueurs, Vocabulaire, Grammaire, Numération.
    <OrdonnerClics v-model="ordre" :elements="q.nombres" :verrou="repondu" :etat="etat" @valider="valider">
      <template #element="{ element }">{{ element }}</template>
    </OrdonnerClics>
  - v-model : les INDICES des éléments touchés, dans l'ordre des clics (pas leurs valeurs : deux mots peuvent être
    égaux). `ordre.map(i => elements[i])` donne la réponse à passer à jeu.repondre.
  - elements : ce qu'on range, en désordre (typé : `E`) ; verrou : plus de clic (question répondue) ; etat : '' | 'ok' |
    'erreur' (jeu.etat) colore la zone de réponse.
  - slots : #element="{ element, index, rang }" contenu d'un bouton (rang : position dans la réponse, -1 si pas
    touché) ; #place="{ element, index, rang }" contenu d'une case de la réponse (par défaut, celui de #element) ;
    le slot par défaut s'affiche entre la réponse et les boutons (flèche d'aide « du plus petit au plus grand »).
  - props de forme : separateur (texte entre deux cases, ex. « → ») ; mots (des mots, pas des nombres : étiquettes larges) ; sansZone (pas de cases : le rang est montré
    dans le bouton, voir #element) ; sansBouton (pas de Valider : l'appelant valide seul quand `complet`).
  - événement valider : clic sur « Valider » (actif quand tous les éléments sont placés). « Annuler » retire le
    dernier élément. La vue vide `ordre` à chaque nouvelle question (surQuestion de useJeu) ; elements doit garder la
    même identité d'un rendu à l'autre (ex. q.nombres).
  Accessibilité (tout au clavier : Tab, Entrée ou Espace) : chaque élément est un bouton (`aria-pressed` une fois
  placé) ; la réponse est un groupe nommé « Ta réponse », annoncé quand il change (aria-live) ; un élément placé reste
  focalisable (`aria-disabled`) et le focus passe au suivant libre, puis à « Valider » : il ne se perd pas.
-->
<template>
  <div class="ordre-clics" :class="{ mots }">
    <div v-if="!sansZone" class="ordre-zone" :class="etat" role="group" :aria-label="t('communs.taReponse')" aria-live="polite">
      <template v-for="(_, k) in elements" :key="k">
        <span v-if="separateur && k > 0" class="ordre-sep" aria-hidden="true">{{ separateur }}</span>
        <span class="ordre-slot" :class="[ordre[k] !== undefined ? 'rempli' : 'vide', etat]">
          <slot v-if="ordre[k] !== undefined" name="place" :element="elements[ordre[k]]" :index="ordre[k]" :rang="k">
            <slot name="element" :element="elements[ordre[k]]" :index="ordre[k]" :rang="k">{{ elements[ordre[k]] }}</slot>
          </slot>
          <span v-else aria-hidden="true">_</span>
        </span>
      </template>
    </div>

    <slot />

    <div class="ordre-grille">
      <button v-for="(e, i) in elements" :key="i" ref="boutons" type="button" class="ordre-btn" :class="{ pris: ordre.includes(i) }"
        :aria-pressed="ordre.includes(i)" :aria-disabled="verrou || ordre.includes(i) || undefined" @click="choisir(i)">
        <slot name="element" :element="e" :index="i" :rang="ordre.indexOf(i)">{{ e }}</slot>
      </button>
    </div>

    <div class="ordre-actions">
      <button type="button" class="btn btn-ghost" :aria-disabled="verrou || !ordre.length || undefined" @click="annuler">{{ t('communs.annuler') }}</button>
      <button v-if="!sansBouton" ref="valider" type="button" class="btn btn-primary" :aria-disabled="verrou || !complet || undefined" @click="envoyer">{{ t('communs.valider') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts" generic="E">
import { computed, ref, nextTick } from 'vue'
import { useLangue } from '../langues/useLangue.ts'

const props = withDefaults(defineProps<{
  // indices des éléments touchés, dans l'ordre des clics
  modelValue: number[]
  elements: readonly E[]
  verrou?: boolean
  // '' | 'ok' | 'erreur' (jeu.etat)
  etat?: string
  separateur?: string
  sansZone?: boolean
  sansBouton?: boolean
  // des mots (Vocabulaire, Grammaire) : étiquettes à la largeur du mot au lieu de pastilles rondes
  mots?: boolean
}>(), { verrou: false, etat: '', separateur: '', sansZone: false, sansBouton: false, mots: false })
const emit = defineEmits<{ 'update:modelValue': [ordre: number[]], valider: [] }>()
type PropsElement = { element: E, index: number, rang: number }
defineSlots<{
  element?(props: PropsElement): unknown
  place?(props: PropsElement): unknown
  default?(): unknown
}>()
const { t } = useLangue()

const ordre = computed(() => props.modelValue)
/** Tous les éléments sont placés (avec `sansBouton`, c'est à l'appelant de valider). */
const complet = computed(() => ordre.value.length >= props.elements.length)
const boutons = ref<HTMLButtonElement[]>([])
const valider = ref<HTMLButtonElement | null>(null)

function choisir(i: number) {
  if (props.verrou || ordre.value.includes(i)) return
  const apres = [...ordre.value, i]
  emit('update:modelValue', apres)
  // le bouton touché n'est plus libre : le focus passe au suivant libre (en rond), sinon à « Valider »
  nextTick(() => {
    const n = props.elements.length
    for (let d = 1; d <= n; d++) {
      const j = (i + d) % n
      if (!apres.includes(j)) return boutons.value[j]?.focus()
    }
    valider.value?.focus()
  })
}
function annuler() {
  if (props.verrou || !ordre.value.length) return
  emit('update:modelValue', ordre.value.slice(0, -1))
}
function envoyer() {
  if (!props.verrou && complet.value) emit('valider')
}
</script>

<style scoped>
.ordre-clics { text-align: center; }
.ordre-zone { display: flex; gap: .75rem; justify-content: center; align-items: center; margin-bottom: .5rem; flex-wrap: wrap; }
.ordre-sep { color: #767676; font-weight: 700; }
.ordre-slot {
  width: 4rem; height: 4rem; border-radius: 12px; display: flex; align-items: center; justify-content: center;
  font-size: 2rem; font-weight: 900; border: 3px solid var(--gris-brd);
}
.ordre-slot.vide { color: #767676; border-style: dashed; }
.ordre-slot.rempli { border-color: var(--bleu); background: #eef5ff; color: var(--bleu-fort); }
.ordre-slot.ok { border-color: var(--vert); background: #f0faf0; color: var(--vert-texte); }
.ordre-slot.erreur { border-color: var(--rouge); background: #fef0f0; color: var(--rouge-texte); }

.ordre-grille { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin: 1.25rem 0; }
.ordre-btn {
  min-width: 4.5rem; min-height: 4.5rem; font: inherit; font-size: 2.2rem; font-weight: 900; border-radius: 50%;
  border: 4px solid var(--orange); background: white; color: var(--orange-texte); cursor: pointer; transition: all .15s;
}
.ordre-btn:hover:not([aria-disabled]) { background: #fff5e0; transform: scale(1.08); }
.ordre-btn.pris { opacity: .3; cursor: default; }
.ordre-btn[aria-disabled]:not(.pris) { cursor: default; }

/* mots : étiquettes à la largeur du mot */
.mots .ordre-btn { border-radius: 999px; font-size: 1.3rem; font-weight: 800; min-height: 3rem; padding: .4rem 1.1rem; }
.mots .ordre-slot { width: auto; min-width: 5rem; height: 3rem; padding: 0 .7rem; font-size: 1.2rem; font-weight: 800; }

.ordre-actions { display: flex; gap: .75rem; justify-content: center; margin-bottom: .75rem; }
.ordre-actions [aria-disabled="true"] { opacity: .5; cursor: default; }
</style>
