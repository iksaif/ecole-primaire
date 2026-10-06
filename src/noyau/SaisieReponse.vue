<!--
  Champ de réponse commun des exercices (plan 10) : clavier adapté sur mobile, pas d'autocomplétion ni de correcteur,
  Entrée pour valider, focus quand le champ devient actif.
    <SaisieReponse v-model="rep" type="nombre" class="exercise-input" :etat="jeu.etat.value" :disabled="repondu"
      focus @entree="valider" />
  type : 'nombre' (entier, pavé numérique), 'decimal' (texte, pavé avec virgule), 'texte' (mot, phrase).
  etat : '' | 'ok' | 'presque' | 'erreur' (useJeu : etat, etatDe), ajouté aux classes du champ.
  focus : le champ prend le focus à l'affichage, et chaque fois qu'il redevient actif (question suivante). Les autres
  attributs (class, placeholder, min, max, inputmode…) passent sur l'<input>.
  Accessibilité : le champ a un nom (`libelle`, sinon « Ta réponse ») ; `aria-describedby` (id du retour de réponse :
  RetourReponse) le relie au message ; `aria-invalid` quand l'état est « erreur ». Après la réponse (`disabled`) le champ
  est en lecture seule et non désactivé : il garde le focus (un champ désactivé le ferait perdre), et Entrée peut
  encore passer à la question suivante (@entree).
-->
<template>
  <input ref="champ" v-model="valeur" :class="etat" :type="type === 'nombre' ? 'number' : 'text'" :inputmode="inputmode"
    :aria-label="libelle || t('communs.taReponse')" :aria-invalid="etat === 'erreur' ? true : undefined"
    :readonly="disabled" :aria-readonly="disabled || undefined" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
    @keydown.enter="$emit('entree')">
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useLangue } from '../langues/useLangue.ts'

const props = withDefaults(defineProps<{
  // 'texte' | 'nombre' (clavier numérique) | 'decimal'
  type?: 'texte' | 'nombre' | 'decimal'
  // '' | 'ok' | 'presque' | 'erreur' (jeu.etat)
  etat?: string
  // la question a reçu sa réponse : champ en lecture seule (garde le focus)
  disabled?: boolean
  focus?: boolean
  // nom accessible du champ (par défaut « Ta réponse »)
  libelle?: string
}>(), { type: 'texte', etat: '', disabled: false, focus: false, libelle: '' })
defineEmits<{ entree: [] }>()
const { t } = useLangue()
// type="number" : Vue rend un nombre (ou '' si vide), comme un v-model posé directement sur l'input
const valeur = defineModel<string | number>({ default: '' })
const champ = ref<HTMLInputElement | null>(null)
const inputmode = computed(() => ({ nombre: 'numeric', decimal: 'decimal' } as Record<string, 'numeric' | 'decimal'>)[props.type])

const donnerFocus = () => nextTick(() => champ.value?.focus?.())
onMounted(() => { if (props.focus && !props.disabled) donnerFocus() })
watch(() => props.focus && !props.disabled, actif => { if (actif) donnerFocus() })

defineExpose({ focus: donnerFocus })
</script>
