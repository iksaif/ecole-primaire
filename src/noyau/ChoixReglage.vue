<!--
  Un réglage à choix d'un exercice du noyau (DefinitionExercice, types.ts) : une rangée de boutons level-btn.
    <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
    <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
      :titre="t('exercices')" :libelles="{ regle: t('regle'), complete: t('complete') }"> aide facultative (slot) </ChoixReglage>
  Typage : `cle` est une clé des réglages de la définition (ou « niveau ») et `v-model` doit avoir le type de cette
  clé ; une clé fautive, ou un v-model croisé, ne compile pas. `libelle` (fonction) et `libelles` (objet : une entrée
  par valeur, donc exhaustif : une valeur oubliée ne compile pas) reçoivent des valeurs typées. Avec une définition
  non typée (`DefinitionExercice<Reglages>`, formulaires génériques) toute clé est permise.
  Valeurs : cle="niveau" → les classes de la définition ; sinon les options du niveau, à défaut les options communes
  de la définition (`options: { nbQ: [5, 10, 15] }`) ; `valeurs` pour un réglage propre à la vue. Choix multiple si la
  valeur est une liste (au moins une valeur reste cochée, l'ordre suit celui des options), choix unique sinon. Une
  valeur `bonus` ou `horsProgramme` du niveau porte la marque « (bonus) » / « (hors programme) », la raison en infobulle.
  Libellé enrichi d'une valeur : <template #valeur="{ valeur, texte }">…</template>. Pour les tests : la section porte
  data-reglage="<cle>", chaque bouton data-valeur="<valeur>".
  Valeurs en groupes sous des sous-titres (Grammaire : « La phrase », « Nature des mots »…) :
    <ChoixReglage … :groupes="[{ titre: 'La phrase', valeurs: ['ordre', 'phrase'] }, …]" />
  Variante « cartes » (un choix qui change la nature de l'exercice : mode lacunes / complet, entraînement / chrono…) :
    <ChoixReglage cartes … :icone="m => m === 'lacunes' ? '✏️' : '📝'" :description="m => t(m + 'Desc')" />
  Accessibilité : la section est un `role="group"` nommé par son titre ; chaque bouton porte `aria-pressed` (choix
  multiple : plusieurs boutons enfoncés) ; la marque « (bonus) » fait partie du nom du bouton.
-->
<template>
  <div class="config-section" role="group" :aria-labelledby="titre ? idTitre : undefined" :data-reglage="cle">
    <div v-if="titre" :id="idTitre" class="config-section-title">{{ titre }}</div>
    <div v-if="cartes" class="cartes-reglage" :class="{ nombreuses: liste.length > 2 }" :style="{ '--nb-cartes': liste.length }">
      <button v-for="v in liste" :key="String(v)" type="button" class="carte-reglage" :class="{ active: actif(v) }" :data-valeur="String(v)"
        :aria-pressed="actif(v)" :title="raison(v)" @click="choisir(v)">
        <div v-if="icone" class="carte-icone" aria-hidden="true">{{ icone(v) }}</div>
        <div class="carte-titre"><slot name="valeur" :valeur="v" :texte="texte(v)">{{ texte(v) }}</slot><span v-if="marque(v)" class="marque-reglage"> ({{ t(marque(v)!) }})</span></div>
        <div v-if="description" class="carte-desc">{{ description(v) }}</div>
      </button>
    </div>
    <template v-else v-for="(section, k) in sections" :key="k">
      <div v-if="section.titre" class="config-section-title sous-titre-reglage">{{ section.titre }}</div>
      <div class="btn-group" role="group" :aria-label="section.titre || undefined">
        <button v-for="v in section.valeurs" :key="String(v)" type="button" class="level-btn" :class="{ active: actif(v) }" :data-valeur="String(v)"
          :aria-pressed="actif(v)" :title="raison(v)"
          @click="choisir(v)"><slot name="valeur" :valeur="v" :texte="texte(v)">{{ texte(v) }}</slot><span v-if="marque(v)" class="marque-reglage"> ({{ t(marque(v)!) }})</span></button>
      </div>
    </template>
    <slot />
  </div>
</template>

<script setup lang="ts" generic="R extends object, K extends (keyof R & string) | 'niveau'">
// textes : section `communs` (bonus, horsProgramme) ; marques lues dans la définition (src/noyau/reglages.ts)
import { computed, useId } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { estBonus, raisonHorsProgramme, valeursDe } from './reglages.ts'
import type { Classe, DefinitionExercice, ValeurOption } from './types.ts'

/** Type de la valeur d'un réglage : les classes pour « niveau », sinon celui de la clé dans les réglages de la définition. */
type ValeurDe<C extends object, Cle extends string> = Cle extends 'niveau' ? Classe : Cle extends keyof C ? C[Cle] : never
/** Une valeur proposée : la valeur elle-même, ou chaque élément d'une liste. */
type Valeur = ValeurDe<R, K> extends readonly (infer E)[] ? E : ValeurDe<R, K>
type Modele = ValeurDe<R, K>

const props = withDefaults(defineProps<{
  definition: DefinitionExercice<R>
  // clé du réglage dans la config (« niveau », « exercices »…)
  cle: K
  // niveau courant (inutile pour cle="niveau")
  niveau?: string
  modelValue: Modele
  titre?: string
  // libellé d'une valeur (par défaut : classe en majuscules, sinon la valeur)
  libelle?: ((v: Valeur) => string) | null
  // libellés par valeur, exhaustif (autre façon de donner `libelle`)
  libelles?: { [V in Valeur & PropertyKey]: string } | null
  // valeurs proposées, quand le réglage n'a d'options ni dans le niveau ni dans `definition.options`
  valeurs?: readonly Valeur[] | null
  // valeurs regroupées sous des sous-titres : [{ titre, valeurs }] (les valeurs absentes des options du niveau sont ignorées)
  groupes?: { titre: string, valeurs: readonly Valeur[] }[] | null
  // variante en cartes (icône, titre, description) plutôt qu'en rangée de boutons
  cartes?: boolean
  icone?: ((v: Valeur) => string) | null
  description?: ((v: Valeur) => string) | null
}>(), { niveau: '', titre: '', libelle: null, libelles: null, valeurs: null, groupes: null, cartes: false, icone: null, description: null })
const emit = defineEmits<{ 'update:modelValue': [valeur: Modele] }>()
defineSlots<{
  // contenu d'une valeur (par défaut son texte)
  valeur?(props: { valeur: Valeur, texte: string }): unknown
  // aide sous les boutons
  default?(): unknown
}>()
const { t } = useLangue()
const idTitre = useId()

// En interne, les valeurs sont lues comme des ValeurOption (le typage fin sert aux appelants)
const brut = (v: Valeur) => v as unknown as ValeurOption
const def = computed(() => props.definition as unknown as DefinitionExercice)
const liste = computed<Valeur[]>(() => (props.valeurs ?? valeursDe(def.value, props.niveau, props.cle)) as unknown as Valeur[])
// rangées de boutons : une seule, ou une par groupe (props.groupes)
const sections = computed(() => (props.groupes
  ? props.groupes.map(g => ({ titre: g.titre, valeurs: g.valeurs.filter(v => liste.value.includes(v)) })).filter(g => g.valeurs.length)
  : [{ titre: '', valeurs: liste.value }]))
const choisies = computed(() => (Array.isArray(props.modelValue) ? (props.modelValue as unknown as Valeur[]) : null))
const texte = (v: Valeur): string => {
  if (props.libelle) return props.libelle(v)
  if (props.libelles) return (props.libelles as Record<PropertyKey, string>)[v as PropertyKey] ?? String(v)
  return props.cle === 'niveau' ? String(v).toUpperCase() : String(v)
}
const raison = (v: Valeur) => raisonHorsProgramme(def.value, props.niveau, props.cle, brut(v)) ?? undefined
// « bonus » ou « hors programme » (clé de la section `communs`), sinon null
const marque = (v: Valeur) => (estBonus(def.value, props.niveau, props.cle, brut(v)) ? 'communs.bonus' as const
  : raisonHorsProgramme(def.value, props.niveau, props.cle, brut(v)) ? 'communs.horsProgramme' as const : null)
const actif = (v: Valeur) => (choisies.value ? choisies.value.includes(v) : (props.modelValue as unknown) === v)

function choisir(v: Valeur) {
  const courantes = choisies.value
  if (!courantes) return emit('update:modelValue', v as unknown as Modele)
  if (courantes.includes(v)) {
    if (courantes.length > 1) emit('update:modelValue', courantes.filter(x => x !== v) as unknown as Modele)
  } else emit('update:modelValue', liste.value.filter(x => x === v || courantes.includes(x)) as unknown as Modele)
}
</script>

<style scoped>
/* cartes : autant de colonnes que de valeurs (une seule sur petit écran au-delà de deux) */
.sous-titre-reglage { margin: .6rem 0 .4rem; text-transform: none; font-weight: 600; color: var(--texte-doux); }
.cartes-reglage { display: grid; grid-template-columns: repeat(var(--nb-cartes), 1fr); gap: .75rem; }
@media (max-width: 560px) { .cartes-reglage.nombreuses { grid-template-columns: 1fr; } }
.carte-reglage {
  border: 3px solid var(--gris-brd); border-radius: var(--radius);
  padding: 1rem; cursor: pointer; transition: all .15s; text-align: center;
  background: white; font-family: inherit; width: 100%;
}
.carte-reglage:hover  { border-color: var(--bleu); }
.carte-reglage.active { border-color: var(--bleu); background: #eef5ff; }
.carte-icone { font-size: 1.75rem; }
.carte-titre { font-weight: 800; font-size: .95rem; margin: .3rem 0 .15rem; }
.carte-desc  { font-size: .78rem; color: #666; }
</style>
