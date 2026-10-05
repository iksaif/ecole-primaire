<template>
  <!--
    Champ de réponse commun des exercices (plan 10) : clavier adapté sur mobile, pas d'autocomplétion ni de correcteur,
    Entrée pour valider, focus quand le champ devient actif.
      <SaisieReponse v-model="rep" type="nombre" class="exercise-input" :etat="jeu.etat.value" :disabled="repondu"
        focus @entree="valider" />
    type : 'nombre' (entier, pavé numérique), 'decimal' (texte, pavé avec virgule), 'texte' (mot, phrase).
    etat : '' | 'ok' | 'presque' | 'erreur' (useJeu : etat, etatDe), ajouté aux classes du champ.
    focus : le champ prend le focus à l'affichage, et chaque fois qu'il redevient actif (question suivante). Les autres
    attributs (class, placeholder, min, max, inputmode…) passent sur l'<input>.
  -->
  <input ref="champ" v-model="valeur" :class="etat" :type="type === 'nombre' ? 'number' : 'text'" :inputmode="inputmode"
    :disabled="disabled" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
    @keydown.enter="$emit('entree')">
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  type: { type: String, default: 'texte' },
  etat: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  focus: { type: Boolean, default: false },
})
defineEmits(['entree'])
// type="number" : Vue rend un nombre (ou '' si vide), comme un v-model posé directement sur l'input
const valeur = defineModel({ type: [String, Number], default: '' })
const champ = ref(null)
const inputmode = computed(() => ({ nombre: 'numeric', decimal: 'decimal' })[props.type])

const donnerFocus = () => nextTick(() => champ.value?.focus?.())
onMounted(() => { if (props.focus && !props.disabled) donnerFocus() })
watch(() => props.focus && !props.disabled, actif => { if (actif) donnerFocus() })

defineExpose({ focus: donnerFocus })
</script>
