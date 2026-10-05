<template>
  <!--
    Un réglage à choix d'un exercice au format « définition » (src/exercices/) : une rangée de boutons level-btn.
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
        :titre="t('exercices')" :libelle="e => t(`ex_${e}`)"> aide facultative (slot) </ChoixReglage>
    Valeurs : cle="niveau" → les classes de la définition ; sinon les options du niveau (`valeurs` pour un réglage
    sans options déclarées, ex. le nombre de questions). Choix multiple si la valeur est une liste (au moins une
    valeur reste cochée, l'ordre suit celui des options), choix unique sinon. Une valeur `bonus` ou `horsProgramme`
    du niveau porte la marque « (bonus) » / « (hors programme) », la raison en infobulle.
  -->
  <div class="config-section">
    <div class="config-section-title">{{ titre }}</div>
    <div class="btn-group">
      <button v-for="v in liste" :key="String(v)" class="level-btn" :class="{ active: actif(v) }"
        :title="raisonHorsProgramme(definition, niveau, cle, v) ?? undefined"
        @click="choisir(v)">{{ texte(v) }}<span v-if="marque(v)" class="marque-reglage"> ({{ t(marque(v)) }})</span></button>
    </div>
    <slot />
  </div>
</template>

<script setup>
// textes : catalogue commun (bonus, horsProgramme) ; marques lues dans la définition (src/exercices/outils.js)
import { computed } from 'vue'
import { useI18n } from '../i18n'
import { estBonus, raisonHorsProgramme, valeursDe } from '../exercices/outils'

const props = defineProps({
  definition: { type: Object, required: true },
  // clé du réglage dans la config (« niveau », « exercices »…)
  cle: { type: String, required: true },
  // niveau courant (inutile pour cle="niveau")
  niveau: { type: String, default: '' },
  modelValue: { type: [String, Number, Boolean, Array], required: true },
  titre: { type: String, default: '' },
  // libellé d'une valeur (par défaut : classe en majuscules, sinon la valeur)
  libelle: { type: Function, default: null },
  // valeurs proposées, quand le réglage n'a pas d'options dans la définition
  valeurs: { type: Array, default: null },
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const liste = computed(() => props.valeurs ?? valeursDe(props.definition, props.niveau, props.cle))
const multiple = computed(() => Array.isArray(props.modelValue))
const texte = v => (props.libelle ? props.libelle(v) : props.cle === 'niveau' ? String(v).toUpperCase() : String(v))
// « bonus » ou « hors programme » (clé du catalogue commun), sinon null
const marque = v => (estBonus(props.definition, props.niveau, props.cle, v) ? 'bonus'
  : raisonHorsProgramme(props.definition, props.niveau, props.cle, v) ? 'horsProgramme' : null)
const actif = v => (multiple.value ? props.modelValue.includes(v) : props.modelValue === v)

function choisir(v) {
  if (!multiple.value) return emit('update:modelValue', v)
  const choisies = props.modelValue
  if (choisies.includes(v)) {
    if (choisies.length > 1) emit('update:modelValue', choisies.filter(x => x !== v))
  } else emit('update:modelValue', liste.value.filter(x => x === v || choisies.includes(x)))
}
</script>
