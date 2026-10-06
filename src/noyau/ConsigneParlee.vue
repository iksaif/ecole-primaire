<!--
  Consigne dite à voix haute (maternelle : les enfants ne lisent pas encore) : lue à chaque nouveau texte, et un bouton 🔊
  pour la réécouter ou l'interrompre. Le texte est aussi écrit (slot par défaut : le texte).
    <ConsigneParlee :texte="t('consigne')" />                       lue à chaque changement de texte
    <ConsigneParlee :texte="…" :auto="false" langue="fr" />          seulement au clic ; langue du texte
  Repli silencieux (useTTS) : si la langue n'a pas de voix (le breton, d'après le registre des langues) ou que le
  navigateur n'en a pas, le bouton est masqué et rien n'est lu ; la consigne reste écrite, pour que l'adulte la lise.
  `langue` : celle du texte (par défaut, celle de l'interface).
  Accessibilité : le bouton a un nom (« Écouter la consigne ») et `aria-pressed` quand il lit.
-->
<template>
  <div class="consigne-parlee">
    <button v-if="possible" type="button" class="ecouter" :aria-pressed="enLecture" :aria-label="t('communs.ecouter')" :title="t('communs.ecouter')" @click="basculer">
      <span aria-hidden="true">🔊</span>
    </button>
    <span class="texte"><slot>{{ texte }}</slot></span>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { useTTS } from './useTTS.ts'
import type { Langue } from '../langues/registre.ts'

const props = withDefaults(defineProps<{
  texte: string
  // langue du texte lu (par défaut, la langue de l'interface)
  langue?: Langue
  // lire à chaque nouveau texte
  auto?: boolean
}>(), { langue: undefined, auto: true })
defineSlots<{ default?(): unknown }>()
const { t, langue: langueInterface } = useLangue()
const { enLecture, peutParler, parler, arreter } = useTTS()

const langueTexte = computed<Langue>(() => props.langue ?? langueInterface.value)
const possible = computed(() => peutParler(langueTexte.value))
const dire = () => parler(props.texte, langueTexte.value, { vitesse: 0.85 })
const basculer = () => (enLecture.value ? arreter() : dire())

watch(() => props.texte, () => { if (props.auto) dire() }, { immediate: true })
onUnmounted(arreter)
</script>

<style scoped>
.consigne-parlee { display: flex; align-items: center; justify-content: center; gap: .75rem; }
.ecouter {
  flex: none; width: 3.5rem; height: 3.5rem; border-radius: 50%; border: 3px solid var(--bleu); background: white;
  font-size: 1.7rem; cursor: pointer; line-height: 1;
}
.ecouter:hover { background: #eaf2fd; }
.ecouter[aria-pressed="true"] { background: #eaf2fd; border-color: var(--bleu-fort); }
</style>
