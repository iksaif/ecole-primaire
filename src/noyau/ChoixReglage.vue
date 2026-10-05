<template>
  <!--
    Un réglage à choix d'un exercice du noyau (DefinitionExercice, types.ts) : une rangée de boutons level-btn.
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
        :titre="t('exercices')" :libelle="e => t(`ex_${e}`)"> aide facultative (slot) </ChoixReglage>
    Valeurs : cle="niveau" → les classes de la définition ; sinon les options du niveau, à défaut les options communes
    de la définition (`options: { nbQ: [5, 10, 15] }`) ; `valeurs` pour un réglage propre à la vue. Choix multiple si la valeur est une liste (au moins une
    valeur reste cochée, l'ordre suit celui des options), choix unique sinon. Une valeur `bonus` ou `horsProgramme`
    du niveau porte la marque « (bonus) » / « (hors programme) », la raison en infobulle.
    Libellé enrichi d'une valeur : <template #valeur="{ valeur, texte }">…</template>. Pour les tests : la section porte
    data-reglage="<cle>", chaque bouton data-valeur="<valeur>".
    Valeurs en groupes sous des sous-titres (Grammaire : « La phrase », « Nature des mots »…) :
      <ChoixReglage … :groupes="[{ titre: 'La phrase', valeurs: ['ordre', 'phrase'] }, …]" />
    Variante « cartes » (un choix qui change la nature de l'exercice : mode lacunes / complet, entraînement / chrono…) :
      <ChoixReglage cartes … :icone="m => m === 'lacunes' ? '✏️' : '📝'" :description="m => t(m + 'Desc')" />
  -->
  <div class="config-section" :data-reglage="cle">
    <div class="config-section-title">{{ titre }}</div>
    <div v-if="cartes" class="cartes-reglage" :class="{ nombreuses: liste.length > 2 }" :style="{ '--nb-cartes': liste.length }">
      <button v-for="v in liste" :key="String(v)" class="carte-reglage" :class="{ active: actif(v) }" :data-valeur="String(v)"
        :title="raisonHorsProgramme(definition, niveau, cle, v) ?? undefined" @click="choisir(v)">
        <div v-if="icone" class="carte-icone">{{ icone(v) }}</div>
        <div class="carte-titre"><slot name="valeur" :valeur="v" :texte="texte(v)">{{ texte(v) }}</slot><span v-if="marque(v)" class="marque-reglage"> ({{ t(marque(v)!) }})</span></div>
        <div v-if="description" class="carte-desc">{{ description(v) }}</div>
      </button>
    </div>
    <template v-else v-for="(section, k) in sections" :key="k">
      <div v-if="section.titre" class="config-section-title sous-titre-reglage">{{ section.titre }}</div>
      <div class="btn-group">
        <button v-for="v in section.valeurs" :key="String(v)" class="level-btn" :class="{ active: actif(v) }" :data-valeur="String(v)"
          :title="raisonHorsProgramme(definition, niveau, cle, v) ?? undefined"
          @click="choisir(v)"><slot name="valeur" :valeur="v" :texte="texte(v)">{{ texte(v) }}</slot><span v-if="marque(v)" class="marque-reglage"> ({{ t(marque(v)!) }})</span></button>
      </div>
    </template>
    <slot />
  </div>
</template>

<script setup lang="ts">
// textes : catalogue commun (bonus, horsProgramme) ; marques lues dans la définition (src/noyau/reglages.ts)
import { computed } from 'vue'
import { useI18n } from '../i18n'
import { estBonus, raisonHorsProgramme, valeursDe } from './reglages.ts'
import type { DefinitionExercice, Reglages, ValeurOption, ValeurReglage } from './types.ts'

const props = withDefaults(defineProps<{
  definition: DefinitionExercice<Reglages>
  // clé du réglage dans la config (« niveau », « exercices »…)
  cle: string
  // niveau courant (inutile pour cle="niveau")
  niveau?: string
  modelValue: ValeurReglage
  titre?: string
  // libellé d'une valeur (par défaut : classe en majuscules, sinon la valeur)
  libelle?: ((v: ValeurOption) => string) | null
  // valeurs proposées, quand le réglage n'a d'options ni dans le niveau ni dans `definition.options`
  valeurs?: readonly ValeurOption[] | null
  // valeurs regroupées sous des sous-titres : [{ titre, valeurs }] (les valeurs absentes des options du niveau sont ignorées)
  groupes?: { titre: string, valeurs: readonly ValeurOption[] }[] | null
  // variante en cartes (icône, titre, description) plutôt qu'en rangée de boutons
  cartes?: boolean
  icone?: ((v: ValeurOption) => string) | null
  description?: ((v: ValeurOption) => string) | null
}>(), { niveau: '', titre: '', libelle: null, valeurs: null, groupes: null, cartes: false, icone: null, description: null })
const emit = defineEmits<{ 'update:modelValue': [valeur: ValeurReglage] }>()
defineSlots<{
  // contenu d'une valeur (par défaut son texte)
  valeur?(props: { valeur: ValeurOption, texte: string }): unknown
  // aide sous les boutons
  default?(): unknown
}>()
const { t } = useI18n()

const liste = computed(() => props.valeurs ?? valeursDe(props.definition, props.niveau, props.cle))
// rangées de boutons : une seule, ou une par groupe (props.groupes)
const sections = computed(() => (props.groupes
  ? props.groupes.map(g => ({ titre: g.titre, valeurs: g.valeurs.filter(v => liste.value.includes(v)) })).filter(g => g.valeurs.length)
  : [{ titre: '', valeurs: liste.value }]))
const choisies = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : null))
const texte = (v: ValeurOption) => (props.libelle ? props.libelle(v) : props.cle === 'niveau' ? String(v).toUpperCase() : String(v))
// « bonus » ou « hors programme » (clé du catalogue commun), sinon null
const marque = (v: ValeurOption) => (estBonus(props.definition, props.niveau, props.cle, v) ? 'bonus'
  : raisonHorsProgramme(props.definition, props.niveau, props.cle, v) ? 'horsProgramme' : null)
const actif = (v: ValeurOption) => (choisies.value ? choisies.value.includes(v as string) : props.modelValue === v)

function choisir(v: ValeurOption) {
  const courantes = choisies.value
  if (!courantes) return emit('update:modelValue', v)
  if (courantes.includes(v as string)) {
    if (courantes.length > 1) emit('update:modelValue', courantes.filter(x => x !== v))
  } else emit('update:modelValue', liste.value.filter(x => x === v || courantes.includes(x as string)) as string[])
}
</script>

<style scoped>
/* cartes : autant de colonnes que de valeurs (une seule sur petit écran au-delà de deux) */
.sous-titre-reglage { margin: .6rem 0 .4rem; text-transform: none; font-weight: 600; color: #888; }
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
