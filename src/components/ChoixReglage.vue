<template>
  <!--
    Un réglage à choix d'un exercice au format « définition » (src/exercices/) : une rangée de boutons level-btn.
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
        :titre="t('exercices')" :libelle="e => t(`ex_${e}`)"> aide facultative (slot) </ChoixReglage>
    Valeurs : cle="niveau" → les classes de la définition ; sinon les options du niveau, à défaut les options communes
    de la définition (`options: { nbQ: [5, 10, 15] }`) ; `valeurs` pour un réglage propre à la vue. Choix multiple si la valeur est une liste (au moins une
    valeur reste cochée, l'ordre suit celui des options), choix unique sinon. Une valeur `bonus` ou `horsProgramme`
    du niveau porte la marque « (bonus) » / « (hors programme) », la raison en infobulle.
    Libellé enrichi d'une valeur : <template #valeur="{ valeur, texte }">…</template>. Pour les tests : la section porte
    data-reglage="<cle>", chaque bouton data-valeur="<valeur>".
    Variante « cartes » (un choix qui change la nature de l'exercice : mode lacunes / complet, entraînement / chrono…) :
      <ChoixReglage cartes … :icone="m => m === 'lacunes' ? '✏️' : '📝'" :description="m => t(m + 'Desc')" />
  -->
  <div class="config-section" :data-reglage="cle">
    <div class="config-section-title">{{ titre }}</div>
    <div v-if="cartes" class="cartes-reglage" :class="{ nombreuses: liste.length > 2 }" :style="{ '--nb-cartes': liste.length }">
      <button v-for="v in liste" :key="String(v)" class="carte-reglage" :class="{ active: actif(v) }" :data-valeur="String(v)"
        :title="raisonHorsProgramme(definition, niveau, cle, v) ?? undefined" @click="choisir(v)">
        <div v-if="icone" class="carte-icone">{{ icone(v) }}</div>
        <div class="carte-titre"><slot name="valeur" :valeur="v" :texte="texte(v)">{{ texte(v) }}</slot><span v-if="marque(v)" class="marque-reglage"> ({{ t(marque(v)) }})</span></div>
        <div v-if="description" class="carte-desc">{{ description(v) }}</div>
      </button>
    </div>
    <div v-else class="btn-group">
      <button v-for="v in liste" :key="String(v)" class="level-btn" :class="{ active: actif(v) }" :data-valeur="String(v)"
        :title="raisonHorsProgramme(definition, niveau, cle, v) ?? undefined"
        @click="choisir(v)"><slot name="valeur" :valeur="v" :texte="texte(v)">{{ texte(v) }}</slot><span v-if="marque(v)" class="marque-reglage"> ({{ t(marque(v)) }})</span></button>
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
  // valeurs proposées, quand le réglage n'a d'options ni dans le niveau ni dans `definition.options`
  valeurs: { type: Array, default: null },
  // variante en cartes (icône, titre, description) plutôt qu'en rangée de boutons
  cartes: { type: Boolean, default: false },
  icone: { type: Function, default: null },
  description: { type: Function, default: null },
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

<style scoped>
/* cartes : autant de colonnes que de valeurs (une seule sur petit écran au-delà de deux) */
.cartes-reglage { display: grid; grid-template-columns: repeat(var(--nb-cartes), 1fr); gap: .75rem; }
@media (max-width: 560px) { .cartes-reglage.nombreuses { grid-template-columns: 1fr; } }
.carte-reglage {
  border: 3px solid var(--gris-brd); border-radius: var(--radius);
  padding: 1rem; cursor: pointer; transition: all .15s; text-align: center;
  background: white; font-family: inherit; width: 100%;
}
.carte-reglage:hover  { border-color: var(--bleu); }
.carte-reglage:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.carte-reglage.active { border-color: var(--bleu); background: #eef5ff; }
.carte-icone { font-size: 1.75rem; }
.carte-titre { font-weight: 800; font-size: .95rem; margin: .3rem 0 .15rem; }
.carte-desc  { font-size: .78rem; color: #666; }
</style>
