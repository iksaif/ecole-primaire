<template>
  <div class="consigne-parlee">
    <button v-if="voix" type="button" class="ecouter" :title="t('ecouter')" :aria-label="t('ecouter')" @click="dire">🔊</button>
    <span class="texte"><slot>{{ texte }}</slot></span>
  </div>
</template>

<script setup>
// Consigne dite à voix haute (maternelle : les enfants ne lisent pas encore) : lue à chaque nouveau texte, et un
// bouton 🔊 pour la réécouter. Pas de voix bretonne dans les navigateurs : en breton, la consigne reste écrite, pour
// que l'adulte la lise (useTTS lit en français).
import { computed, watch, onUnmounted } from 'vue'
import { useTTS } from '../composables/useTTS'
import { useI18n } from '../i18n'
import messagesFr from '../i18n/fr/components/ConsigneParlee.js'
import messagesBr from '../i18n/br/components/ConsigneParlee.js'

const props = defineProps({ texte: { type: String, required: true }, auto: { type: Boolean, default: true } })
const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })
const { lire, arreter } = useTTS()
const voix = computed(() => langue.value === 'fr' && typeof window !== 'undefined' && 'speechSynthesis' in window)
const dire = () => voix.value && lire(props.texte, { vitesse: 0.85 })

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
</style>
